import { describe, it, expect, vi } from 'vitest';
import nodemailer from 'nodemailer';
import { sendEmailOTP } from '../utils/email.js';

// Mock nodemailer
vi.mock('nodemailer', () => ({
    default: {
        createTransport: vi.fn().mockReturnValue({
            sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' })
        })
    }
}));

describe('Email Service Unit Tests', () => {
    it('should call sendMail with correct parameters', async () => {
        const mockSendMail = nodemailer.createTransport({}).sendMail;
        const testEmail = 'test@example.com';
        const testOTP = '123456';

        await sendEmailOTP(testEmail, testOTP);

        expect(mockSendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: testEmail,
                subject: 'Your SkillAnchor OTP',
                text: testOTP
            })
        );
    });

    it('should throw error if sendMail fails', async () => {
        const mockSendMail = nodemailer.createTransport({}).sendMail;
        vi.mocked(mockSendMail).mockRejectedValueOnce(new Error('SMTP Error'));

        await expect(sendEmailOTP('err@test.com', '000'))
            .rejects.toThrow('Failed to send OTP email');
    });
});
