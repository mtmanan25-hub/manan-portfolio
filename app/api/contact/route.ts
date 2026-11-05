import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { name, email, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            return NextResponse.json(
                { error: "Admin email is not configured." },
                { status: 500 }
            );
        }

        // Email to you
        await resend.emails.send({
            from: "Manan Khatri <hello@manankhatri.xyz>",
            to: adminEmail,
            replyTo: email,
            subject: `New message from ${name}`,
            text: `You received a new message through manankhatri.xyz.

Name: ${name}
Email: ${email}

Message:
${message}`,
        });

        // Confirmation email to visitor
        await resend.emails.send({
            from: "Manan Khatri <hello@manankhatri.xyz>",
            to: email,
            subject: "Thanks for reaching out!",
            text: `Hi ${name},

Thanks for reaching out through my website.

I've received your message and will get back to you soon.

Your message:

"${message}"

— Manan`,
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("Email sending error:", error);

        return NextResponse.json(
            { error: "Failed to send email." },
            { status: 500 }
        );
    }
}