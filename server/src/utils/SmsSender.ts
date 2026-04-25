const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

export const sendOtp = async (phoneNumber: string, otp: string) => {
    try {
        await client.messages.create({
            body: `Nitten kaaali ni arrinna ninta vichaarem: ${otp}`,
            from: twilioNumber,
            to: phoneNumber,
        });
        console.log(`OTP sent to ${phoneNumber}`);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
};

