import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

type Props = {
    url: string;
};

export function Email({ url }: Props) {
    return (
        <Html>
            <Head />
            <Preview>
                Reset your ChessVision password
            </Preview>

            <Body style={styles.body}>
                <Container style={styles.container}>

                    {/* Header */}
                    <Section style={styles.header}>
                        <Heading style={styles.logo}>
                            ChessVision
                        </Heading>

                        <Text style={styles.subtitle}>
                            Password Reset
                        </Text>
                    </Section>

                    {/* Main Content */}
                    <Section style={styles.content}>
                        <Heading style={styles.heading}>
                            Reset Your Password
                        </Heading>

                        <Text style={styles.description}>
                            We received a request to reset the password
                            associated with your ChessVision account.
                        </Text>

                        <Text style={styles.description}>
                            Click the button below to create a new password.
                        </Text>

                        <Section style={styles.buttonContainer}>
                            <Button
                                href={url}
                                style={styles.button}
                            >
                                Reset Password
                            </Button>
                        </Section>

                        <Text style={styles.info}>
                            If you didn't request a password reset,
                            you can safely ignore this email.
                            Your password will remain unchanged.
                        </Text>

                        <Hr style={styles.divider} />

                        <Text style={styles.linkLabel}>
                            Having trouble with the button?
                            Copy and paste this link into your browser:
                        </Text>

                        <Text style={styles.link}>
                            {url}
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={styles.footer}>

                        <Text style={styles.footerText}>
                            This is an automated security email.
                        </Text>
                    </Section>

                </Container>
            </Body>
        </Html>
    );
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
        overflow: "hidden" as const,
    },

    header: {
        backgroundColor: "#1E3049",
        padding: "32px 24px",
        textAlign: "center" as const,
    },

    logo: {
        color: "#FFFFFF",
        fontSize: "30px",
        fontWeight: "bold" as const,
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
        fontWeight: "bold" as const,
        marginBottom: "24px",
    },

    description: {
        color: "#C0CEE0",
        fontSize: "15px",
        lineHeight: "26px",
        marginBottom: "16px",
    },

    buttonContainer: {
        textAlign: "center" as const,
        margin: "32px 0",
    },

    button: {
        backgroundColor: "#4169A8",
        color: "#FFFFFF",
        padding: "15px 36px",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: "bold" as const,
        textDecoration: "none",
        textAlign: "center" as const,
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
        overflowWrap: "anywhere" as const,
    },

    footer: {
        padding: "20px",
        textAlign: "center" as const,
        backgroundColor: "#101D2E",
    },

    footerText: {
        color: "#7185A3",
        fontSize: "11px",
        lineHeight: "18px",
    },
};

export default Email;