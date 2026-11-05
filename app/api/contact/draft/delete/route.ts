import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const { draftToken } = await request.json();

        if (
            typeof draftToken !== "string" ||
            draftToken.length < 20 ||
            draftToken.length > 100
        ) {
            return NextResponse.json(
                { error: "Invalid draft token." },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("contact_drafts")
            .delete()
            .eq("draft_token", draftToken);

        if (error) {
            console.error("DELETE DRAFT ERROR:", error);

            return NextResponse.json(
                { error: "Could not delete draft." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE API ERROR:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}