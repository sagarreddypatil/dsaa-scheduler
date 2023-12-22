// from examples/base, used as the default release binary

package main

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/ghupdate"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	webpush "github.com/SherClockHolmes/webpush-go"
)

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

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS(publicDir), indexFallback))
		return nil
	})

	// --------------------------- Custom Code ---------------------------

	godotenv.Load(".env")

	VAPIDPrivateKey := os.Getenv("VAPID_PRIVATE_KEY")
	VAPIDPublicKey := os.Getenv("VAPID_PUBLIC_KEY")

	app.OnRecordAfterCreateRequest("stateChanges").Add(func(e *core.RecordCreateEvent) error {
		// get user's subscription (need to derefernece e.Record)
		token := e.HttpContext.Request().Header.Get("Authorization")
		if token == "" {
			return nil
		}

		user, err := app.Dao().FindAuthRecordByToken(token, app.Settings().RecordAuthToken.Secret)
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

		app.Dao().ExpandRecord(e.Record, []string{"task"}, nil)

		payload := map[string]interface{}{
			"stateChange": e.Record,
			"task":        e.Record.ExpandedOne("task"),
		}

		message, err := json.Marshal(payload)
		if err != nil {
			return err
		}

		resp, err := webpush.SendNotification(message, s, &webpush.Options{
			Subscriber:      "http://sagarpatil.me",
			VAPIDPublicKey:  VAPIDPublicKey,
			VAPIDPrivateKey: VAPIDPrivateKey,
			TTL:             30,
		})

		if err != nil {
			log.Println("Error sending notification:", err)
			return err
		}

		// read resp and print for debug
		bodyContent := make([]byte, 1024)
		resp.Body.Read(bodyContent)
		log.Println("Response: ", string(bodyContent))

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
