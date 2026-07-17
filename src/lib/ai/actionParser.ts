export interface ChatAction {

    type:
        | "navigate"
        | "theme"
        | "none";

    value?: string;

}

export function parseActions(text: string) {

    let cleanText = text;

    const action: ChatAction = {

        type: "none"

    };

    const navigate = text.match(/\[NAVIGATE:([^\]]+)\]/);

    if (navigate) {

        action.type = "navigate";

        action.value = navigate[1].trim();

        cleanText = cleanText.replace(
            navigate[0],
            ""
        );

    }

    const theme = text.match(/\[ACTION:(THEME_DARK|THEME_LIGHT)\]/);

    if (theme) {

        action.type = "theme";

        action.value =
            theme[1] === "THEME_DARK"
                ? "dark"
                : "light";

        cleanText = cleanText.replace(
            theme[0],
            ""
        );

    }

    return {

        text: cleanText.trim(),

        action

    };

}