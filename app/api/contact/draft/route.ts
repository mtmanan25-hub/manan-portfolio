import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            draftToken,
            visitorId,
            name,
            email,
            message,
        } = body;

        if (!draftToken) {
            return NextResponse.json(
                { error: "Missing draft token." },
                { status: 400 }
            );
        }

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

        const { data: existingDraft, error: findError } = await supabase
            .from("contact_drafts")
            .select("id, draft_token")
            .eq("draft_token", draftToken)
            .maybeSingle();

        if (findError) {
            console.error("DRAFT LOOKUP ERROR:", findError);

            return NextResponse.json(
                { error: "Could not save draft." },
                { status: 500 }
            );
        }

        const draftData = {
            draft_token: draftToken,
            visitor_id:
                typeof visitorId === "string" ? visitorId.slice(0, 100) : null,
            name:
                typeof name === "string" ? name.slice(0, 80) : "",
            email:
                typeof email === "string" ? email.slice(0, 200) : "",
            message:
                typeof message === "string" ? message.slice(0, 5000) : "",
            updated_at: new Date().toISOString(),
            abandoned_at: null,
        };

        if (existingDraft) {
            const { error } = await supabase
                .from("contact_drafts")
                .update(draftData)
                .eq("draft_token", draftToken);

            if (error) {
                console.error("DRAFT UPDATE ERROR:", error);

                return NextResponse.json(
                    { error: "Could not update draft." },
                    { status: 500 }
                );
            }
        } else {
            const { error } = await supabase
                .from("contact_drafts")
                .insert(draftData);

            if (error) {
                console.error("DRAFT INSERT ERROR:", error);

                return NextResponse.json(
                    { error: "Could not save draft." },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DRAFT API ERROR:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}