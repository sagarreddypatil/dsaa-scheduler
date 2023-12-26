// from examples/base, used as the default release binary

package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/ghupdate"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/types"

	webpush "github.com/SherClockHolmes/webpush-go"
)

func GenerateRandomToken() (string, error) {
	tokenLength := 16 // 128 bits = 16 bytes

	token := make([]byte, tokenLength)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}

	// Convert bytes to hex string
	tokenStr := base64.URLEncoding.EncodeToString(token)
	return tokenStr, nil
}

func main() {
	app := pocketbase.New()

	// ---------------------------------------------------------------
	// Optional plugin flags:
	// ---------------------------------------------------------------

	var hooksDir string
	app.RootCmd.PersistentFlags().StringVar(
		&hooksDir,
		"hooksDir",
		"",
		"the directory with the JS app hooks",
	)

	var hooksWatch bool
	app.RootCmd.PersistentFlags().BoolVar(
		&hooksWatch,
		"hooksWatch",
		true,
		"auto restart the app on pb_hooks file change",
	)

	var hooksPool int
	app.RootCmd.PersistentFlags().IntVar(
		&hooksPool,
		"hooksPool",
		25,
		"the total prewarm goja.Runtime instances for the JS app hooks execution",
	)

	var migrationsDir string
	app.RootCmd.PersistentFlags().StringVar(
		&migrationsDir,
		"migrationsDir",
		"",
		"the directory with the user defined migrations",
	)

	var automigrate bool
	app.RootCmd.PersistentFlags().BoolVar(
		&automigrate,
		"automigrate",
		true,
		"enable/disable auto migrations",
	)

	var publicDir string
	app.RootCmd.PersistentFlags().StringVar(
		&publicDir,
		"publicDir",
		defaultPublicDir(),
		"the directory to serve static files",
	)

	var indexFallback bool
	app.RootCmd.PersistentFlags().BoolVar(
		&indexFallback,
		"indexFallback",
		true,
		"fallback the request to index.html on missing static path (eg. when pretty urls are used with SPA)",
	)

	var queryTimeout int
	app.RootCmd.PersistentFlags().IntVar(
		&queryTimeout,
		"queryTimeout",
		30,
		"the default SELECT queries timeout in seconds",
	)

	app.RootCmd.ParseFlags(os.Args[1:])

	// ---------------------------------------------------------------
	// Plugins and hooks:
	// ---------------------------------------------------------------

	// load jsvm (hooks and migrations)
	jsvm.MustRegister(app, jsvm.Config{
		MigrationsDir: migrationsDir,
		HooksDir:      hooksDir,
		HooksWatch:    hooksWatch,
		HooksPoolSize: hooksPool,
	})

	// migrate command (with js templates)
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
		Automigrate:  automigrate,
		Dir:          migrationsDir,
	})

	// GitHub selfupdate
	ghupdate.MustRegister(app, app.RootCmd, ghupdate.Config{})

	app.OnAfterBootstrap().PreAdd(func(e *core.BootstrapEvent) error {
		app.Dao().ModelQueryTimeout = time.Duration(queryTimeout) * time.Second
		return nil
	})

	// --------------------------- Custom Code ---------------------------

	RequireAPIToken := func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			auth := c.Request().Header.Get("Authorization")

			authSplit := strings.Split(auth, "Bearer ")
			if len(authSplit) != 2 {
				return apis.NewUnauthorizedError("Missing Bearer Prefix", nil)
			}

			token := authSplit[1]

			// find user by token
			user, err := app.Dao().FindFirstRecordByData("users", "apiToken", token)
			if err != nil {
				return apis.NewUnauthorizedError("Error retrieving user", nil)
			}
			if user == nil {
				return apis.NewUnauthorizedError("Invalid API token", nil)
			}

			// set user in context
			// apis.RequestInfo(c).AuthRecord = user
			c.Set(apis.ContextAuthRecordKey, user)

			return next(c)
		}
	}

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {

		e.Router.GET("/api/v1/token", func(c echo.Context) error {
			record := apis.RequestInfo(c).AuthRecord

			// create new token, write it to record and return
			token, err := GenerateRandomToken()
			if err != nil {
				return err
			}

			record.Set("apiToken", token)
			err = app.Dao().SaveRecord(record)
			if err != nil {
				return err
			}

			return c.JSON(200, map[string]interface{}{
				"token": token,
			})
		}, apis.RequireRecordAuth())

		e.Router.GET("/api/v1/evict", func(c echo.Context) error {
			record := apis.RequestInfo(c).AuthRecord

			// get all state changes of this user
			stateChangesCollection, err := app.Dao().FindCollectionByNameOrId("stateChanges")
			// tasksCollection, err := app.Dao().FindCollectionByNameOrId("tasks")
			if err != nil {
				return err
			}

			filter := fmt.Sprintf("user = '%s'", record.Id)

			tasks, err := app.Dao().FindRecordsByFilter(
				"tasks",
				filter,
				"",
				-1,
				-1,
			)
			if err != nil {
				return err
			}

			// for each task, if it's current, evict it
			for _, task := range tasks {
				if task.GetString("status") != "CURRENT" {
					continue
				}

				newTime := types.NowDateTime()

				newStateChange := models.NewRecord(stateChangesCollection)
				newStateChange.Set("task", task.Id)
				newStateChange.Set("status", "READY")
				newStateChange.Set("timestamp", newTime)
				err = app.Dao().SaveRecord(newStateChange)

				if err != nil {
					return err
				}

				// update the task itself
				task.Set("status", "READY") // this is redundant but i don't wanna mess with it
				task.Set("timestamp", newTime)
				err = app.Dao().SaveRecord(task)

				if err != nil {
					return err
				}
			}

			return c.JSON(200, map[string]interface{}{
				"message": "Success",
			})
		}, RequireAPIToken)

		// --------------------------- End Custom Code ---------------------------

		// serves static files from the provided public dir (if exists)
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS(publicDir), indexFallback))
		return nil
	})

	// --------------------------- Custom Code ---------------------------

	godotenv.Load(".env")

	VAPIDPrivateKey := os.Getenv("VAPID_PRIVATE_KEY")
	VAPIDPublicKey := os.Getenv("VAPID_PUBLIC_KEY")

	// print public key for debugging
	log.Println("VAPID Public Key: ", VAPIDPublicKey)

	app.OnModelAfterCreate("stateChanges").Add(func(e *core.ModelEvent) error {
		// Change the task's status to the new status

		// Get the stateChange record, e.Record doesn't exist
		record, err := app.Dao().FindRecordById("stateChanges", e.Model.GetId())
		if err != nil {
			return err
		}

		task, err := app.Dao().FindRecordById("tasks", record.GetString("task"))
		if err != nil {
			return err
		}

		// Set the task's status and timestamp
		task.Set("status", record.GetString("status"))
		task.Set("timestamp", record.GetDateTime("timestamp"))

		// Save the task record
		err = app.Dao().SaveRecord(task)
		if err != nil {
			return err
		}

		// get the user
		user, err := app.Dao().FindRecordById("users", task.GetString("user"))
		if err != nil {
			return err
		}

		subscription := user.GetString("webPushSubscription")
		if subscription == "" {
			log.Println("No subscription found for user:", user.Id)
			return nil
		}

		s := &webpush.Subscription{}
		json.Unmarshal([]byte(subscription), s)

		payload := map[string]interface{}{
			"stateChange": record,
			"task":        task,
		}

		message, err := json.Marshal(payload)
		if err != nil {
			return err
		}

		resp, err := webpush.SendNotification(message, s, &webpush.Options{
			Subscriber:      "sagarreddypatil@gmail.com",
			VAPIDPublicKey:  VAPIDPublicKey,
			VAPIDPrivateKey: VAPIDPrivateKey,
			TTL:             30,
		})

		if err != nil {
			log.Println("Error sending notification:", err)
			return err
		}

		// read resp and print for debug
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Println("Error reading response body:", err)
			return err
		}
		log.Println("Response body:", string(body))

		defer resp.Body.Close()
		return nil
	})

	// --------------------------- End Custom Code ---------------------------

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

// the default pb_public dir location is relative to the executable
func defaultPublicDir() string {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		// most likely ran with go run
		return "./pb_public"
	}

	return filepath.Join(os.Args[0], "../pb_public")
}
