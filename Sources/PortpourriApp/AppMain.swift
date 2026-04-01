import AppKit
import SwiftUI
import UserNotifications

enum NotificationAuthorizationCoordinator {
    static let options: UNAuthorizationOptions = [.alert, .sound]

    static func request(using block: @escaping @Sendable () async -> Void) {
        Task {
            await block()
        }
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    let store = PortpourriStore(
        useSampleData: ProcessInfo.processInfo.arguments.contains("--sample-data") ||
            ProcessInfo.processInfo.environment["PORTPOURRI_SAMPLE_DATA"] == "1"
    )

    private var statusBarController: StatusBarController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        self.requestNotificationPermissions()
        self.store.start()
        self.statusBarController = StatusBarController(store: self.store)
    }

    func applicationWillTerminate(_ notification: Notification) {
        self.store.stop()
    }

    private func requestNotificationPermissions() {
        guard Bundle.main.bundleIdentifier != nil else { return }
        NotificationAuthorizationCoordinator.request {
            _ = try? await UNUserNotificationCenter.current().requestAuthorization(
                options: NotificationAuthorizationCoordinator.options
            )
        }
    }
}

@main
struct PortpourriAppMain: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        Settings {
            SettingsRootView(store: self.appDelegate.store)
        }
    }
}
