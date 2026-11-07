import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text, } from "@react-email/components";
export function ActivationEmail({ url, username }) {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsx(Preview, { children: "Activate your ChessVision account" }), _jsx(Body, { style: styles.body, children: _jsxs(Container, { style: styles.container, children: [_jsxs(Section, { style: styles.header, children: [_jsx(Heading, { style: styles.logo, children: "ChessVision" }), _jsx(Text, { style: styles.subtitle, children: "ACCOUNT ACTIVATION" })] }), _jsxs(Section, { style: styles.content, children: [_jsx(Heading, { style: styles.heading, children: "Welcome to ChessVision!" }), _jsx(Text, { style: styles.description, children: username
                                        ? `Hey ${username},`
                                        : "Hey there," }), _jsx(Text, { style: styles.description, children: "Thanks for joining ChessVision! You're one step away from activating your account and getting started." }), _jsx(Text, { style: styles.description, children: "Please verify your email address by clicking the button below." }), _jsx(Section, { style: styles.buttonContainer, children: _jsx(Button, { href: url, style: styles.button, children: "Activate Account" }) }), _jsx(Text, { style: styles.expiration, children: "This activation link expires in 24 hours." }), _jsx(Text, { style: styles.info, children: "If you didn't create a ChessVision account, you can safely ignore this email. No action is required." }), _jsx(Hr, { style: styles.divider }), _jsx(Text, { style: styles.linkLabel, children: "Having trouble with the button? Copy and paste this link into your browser:" }), _jsx(Text, { style: styles.link, children: url })] }), _jsx(Section, { style: styles.footer, children: _jsx(Text, { style: styles.footerText, children: "This is an automated account verification email from ChessVision." }) })] }) })] }));
}
const styles = {
    body: {
        backgroundColor: "#0B1423",
        fontFamily: "Arial, Helvetica, sans-serif",
        margin: "0",
        padding: "40px 12px",
    },
    container: {
        backgroundColor: "#17263B",
        borderRadius: "16px",
        maxWidth: "520px",
        margin: "0 auto",
        overflow: "hidden",
    },
    header: {
        backgroundColor: "#1E3049",
        padding: "32px 24px",
        textAlign: "center",
    },
    logo: {
        color: "#FFFFFF",
        fontSize: "30px",
        fontWeight: "bold",
        margin: "0",
    },
    subtitle: {
        color: "#8FA9CC",
        fontSize: "11px",
        letterSpacing: "2px",
        marginTop: "10px",
    },
    content: {
        padding: "36px 32px",
    },
    heading: {
        color: "#FFFFFF",
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "24px",
    },
    description: {
        color: "#C0CEE0",
        fontSize: "15px",
        lineHeight: "26px",
        marginBottom: "16px",
    },
    buttonContainer: {
        textAlign: "center",
        margin: "32px 0",
    },
    button: {
        backgroundColor: "#4169A8",
        color: "#FFFFFF",
        padding: "15px 36px",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: "bold",
        textDecoration: "none",
        textAlign: "center",
    },
    expiration: {
        color: "#93B4F5",
        fontSize: "13px",
        lineHeight: "22px",
        textAlign: "center",
        marginBottom: "24px",
    },
    info: {
        color: "#91A7C6",
        fontSize: "13px",
        lineHeight: "22px",
        marginTop: "24px",
    },
    divider: {
        borderColor: "#30425B",
        margin: "28px 0",
    },
    linkLabel: {
        color: "#91A7C6",
        fontSize: "12px",
        lineHeight: "20px",
    },
    link: {
        color: "#93B4F5",
        fontSize: "12px",
        lineHeight: "20px",
        overflowWrap: "anywhere",
    },
    footer: {
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#101D2E",
    },
    footerText: {
        color: "#7185A3",
        fontSize: "11px",
        lineHeight: "18px",
    },
};
export default ActivationEmail;
