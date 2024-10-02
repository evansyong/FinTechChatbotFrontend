import { Box, Card, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

function Chat() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <Card padding={10}>
                    <Text>Chat</Text>
                </Card>
            </Box>
        </motion.div>
    );
}

export default Chat;