import AppKit
import XCTest
@testable import PortpourriApp

final class AppRuntimeTests: XCTestCase {
    func testAppearanceModeMapsToExpectedSystemValues() {
        XCTAssertNil(AppearanceMode.system.nsAppearanceName)
        XCTAssertEqual(AppearanceMode.light.nsAppearanceName, .aqua)
        XCTAssertEqual(AppearanceMode.dark.nsAppearanceName, .darkAqua)
    }

    func testNotificationAuthorizationCoordinatorRunsInjectedAuthorizationBlock() async {
        let expectation = expectation(description: "authorization block ran")

        NotificationAuthorizationCoordinator.request {
            expectation.fulfill()
        }

        await fulfillment(of: [expectation], timeout: 1.0)
    }
}
