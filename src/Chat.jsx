/* eslint-disable react-hooks/exhaustive-deps */

import { Box, Card, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import instance from "./networking";

function Chat() {
    const navigate = useNavigate();

    const retrieveSessionAndPersist = async () => {
        try {
            const retrieveSession = await instance.get("/getSession");
    
            if (retrieveSession.data.message === "SUCCESS: Session is active.") {
                localStorage.setItem("activeSession", true);
            } else {
                localStorage.removeItem("activeSession");
                console.log("No active session.");
                navigate("/");
            }
        } catch (error) {
            localStorage.removeItem("activeSession");
            console.log("Failed to retrieve active session. Error: " + error.message);
            navigate("/");
        }
    };

    useEffect(() => {
        retrieveSessionAndPersist()
    }, [])

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