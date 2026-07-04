export interface TelephonyProvider {
  sendSms(to: string, message: string): Promise<boolean>;
  initiateCall(to: string, flowUrl: string): Promise<boolean>;
}

export class TwilioProvider implements TelephonyProvider {
  private client: any;
  
  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken && accountSid !== 'mock_twilio_account_sid') {
      this.client = require('twilio')(accountSid, authToken);
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.client) {
      console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
      return true;
    }
    try {
      await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });
      return true;
    } catch (e) {
      console.error('Twilio SMS error:', e);
      return false;
    }
  }

  async initiateCall(to: string, flowUrl: string): Promise<boolean> {
    if (!this.client) {
      console.log(`[MOCK CALL] To: ${to}, Flow: ${flowUrl}`);
      return true;
    }
    try {
      await this.client.calls.create({
        url: flowUrl,
        to,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      return true;
    } catch (e) {
      console.error('Twilio Call error:', e);
      return false;
    }
  }
}

export class ExotelProvider implements TelephonyProvider {
  async sendSms(to: string, message: string): Promise<boolean> {
    console.log(`[EXOTEL SMS STUB] To: ${to}`);
    return true;
  }
  async initiateCall(to: string, flowUrl: string): Promise<boolean> {
    console.log(`[EXOTEL CALL STUB] To: ${to}`);
    return true;
  }
}

// Factory
export const getTelephonyProvider = (): TelephonyProvider => {
  return new TwilioProvider(); // Could be switched based on env
};
