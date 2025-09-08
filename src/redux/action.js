export const session_token = (token) => {
    return {
        type: "TOKEN",
        token,
    };
};