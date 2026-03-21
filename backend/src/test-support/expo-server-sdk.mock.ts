export const mockSendPushNotificationsAsync = jest.fn();
export const mockIsExpoPushToken = jest.fn();

class MockExpo {
  static isExpoPushToken = mockIsExpoPushToken;

  sendPushNotificationsAsync = mockSendPushNotificationsAsync;
}

export default MockExpo;
