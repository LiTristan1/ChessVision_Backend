import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text, } from "@react-email/components";
export function Email({ url }) {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsx(Preview, { children: "Reset your ChessVision password" }), _jsx(Body, { style: styles.body, children: _jsxs(Container, { style: styles.container, children: [_jsxs(Section, { style: styles.header, children: [_jsx(Heading, { style: styles.logo, children: "ChessVision" }), _jsx(Text, { style: styles.subtitle, children: "Password Reset" })] }), _jsxs(Section, { style: styles.content, children: [_jsx(Heading, { style: styles.heading, children: "Reset Your Password" }), _jsx(Text, { style: styles.description, children: "We received a request to reset the password associated with your ChessVision account." }), _jsx(Text, { style: styles.description, children: "Click the button below to create a new password." }), _jsx(Section, { style: styles.buttonContainer, children: _jsx(Button, { href: url, style: styles.button, children: "Reset Password" }) }), _jsx(Text, { style: styles.info, children: "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged." }), _jsx(Hr, { style: styles.divider }), _jsx(Text, { style: styles.linkLabel, children: "Having trouble with the button? Copy and paste this link into your browser:" }), _jsx(Text, { style: styles.link, children: url })] }), _jsx(Section, { style: styles.footer, children: _jsx(Text, { style: styles.footerText, children: "This is an automated security email." }) })] }) })] }));
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
export default Email;
