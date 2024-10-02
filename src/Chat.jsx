/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */

import React from "react";
import { Box, Card, Text, Image, Skeleton, Input, Button, Menu, MenuButton, MenuList, MenuItem, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, useToast, Tooltip } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import instance from "./networking";

function Chat() {
    const [session, setSession] = useState(null);
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [prompt, setPrompt] = useState("");
    const [validPrompt, setValidPrompt] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const [answerMode, setAnswerMode] = useState("pipeline"); // pipeline or direct
    const [searchType, setSearchType] = useState("similarity"); // similarity or mmr
    const [chunks, setChunks] = useState(1); // 1 to 10 (inclusive)
    const [fetchedChunks, setFetchedChunks] = useState(1); // 1 to 10 (inclusive) - MUST BE HIGHER THAN CHUNKS (k)
    const [temperature, setTemperature] = useState(parseFloat(0.0)); // 0.0, 0.3, 0.5, 0.8 OR 1.0 (1.0 is the most creative)

    function showToast(title, description, status, duration, isClosable) {
        toast.closeAll();
        toast({
            title: title,
            description: description,
            status: status,
            duration: duration,
            isClosable: isClosable
        });
    }

    const retrieveSessionAndPersist = async () => {
        try {
            const retrieveSession = await instance.get("/getSession");

            if (retrieveSession.data.message === "SUCCESS: Session is active.") {
                localStorage.setItem("activeSession", true);
                setSession(retrieveSession.data);
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

    const handleDeleteSession = async () => {
        try {
            const deleteSession = await instance.post("/deleteSession");
            if (deleteSession.data === "SUCCESS: Session deleted.") {
                localStorage.removeItem("activeSession");
                onClose();
                navigate("/");
            }
        } catch (error) {
            console.log("Failed to delete session. Error: " + error);
            showToast(
                "Uh-oh!",
                "An unknown error occurred",
                "warning",
                3500,
                true
            );
        }
    }

    const handleSubmitPrompt = async () => {
        try {
            setPrompt("");
            setIsSubmitting(true);
            const userMessageObject = { client: "user", message: prompt, error: false };
            setChatHistory((prev) => [...prev, userMessageObject]);

            const submitPrompt = await instance.post("/newPrompt", {
                prompt: prompt,
                configuration: {
                    answer_mode: answerMode,
                    search_type: searchType,
                    k: chunks,
                    fetch_k: fetchedChunks,
                    temperature: parseFloat(temperature)
                }
            });
            if (typeof submitPrompt.data === "string" && submitPrompt.data.startsWith("ERROR")) {
                setIsSubmitting(false);
                console.log("Failed to process prompt. Error: " + submitPrompt.data);
                showToast(
                    "Uh-oh!",
                    submitPrompt.data.substring("ERROR: ".length),
                    "info",
                    3500,
                    true
                );

                setChatHistory((prev) => {
                    const updatedHistory = [...prev];
                    updatedHistory[updatedHistory.length - 1].error = true;
                    return updatedHistory;
                });
            } else {
                if (submitPrompt.data.message.startsWith("ERROR")) {
                    setIsSubmitting(false);
                    console.log("Failed to submit prompt. Error: " + submitPrompt.data);
                    showToast(
                        "Uh-oh!",
                        submitPrompt.data.message.substring("ERROR: ".length),
                        "info",
                        3500,
                        true
                    );

                    setChatHistory((prev) => {
                        const updatedHistory = [...prev];
                        updatedHistory[updatedHistory.length - 1].error = true;
                        return updatedHistory;
                    });
                } else if (submitPrompt.data.message.startsWith("SUCCESS")) {
                    setIsSubmitting(false);
                    const systemMessageObject = { client: "assistant", message: submitPrompt.data.answer };
                    setChatHistory((prev) => [...prev, systemMessageObject]);
                }
            }
        } catch (error) {
            setPrompt("");
            setIsSubmitting(false);
            console.log("Failed to submit prompt. Error: " + error);
            showToast(
                "Uh-oh!",
                "An unknown error occurred",
                "warning",
                3500,
                true
            );

            setChatHistory((prev) => {
                const updatedHistory = [...prev];
                updatedHistory[updatedHistory.length - 1].error = true;
                return updatedHistory;
            });
        }
    }

    const handleKeyDown = async (event) => {
        if (event.key === "Enter") {
            handleSubmitPrompt();
        }
    }

    const handlePromptChange = (event) => {
        setPrompt(event.target.value);
        // strip the value of whitespaces and check if it's empty
        if (event.target.value.trim() !== "") {
            setValidPrompt(true);
        } else {
            setValidPrompt(false);
        }
    }

    useEffect(() => {
        retrieveSessionAndPersist()
    }, [])

    useEffect(() => {
        if (session !== null) {
            console.log(session);
            session["history"].forEach((chat) => {
                const chatObject = { client: chat.role, message: chat.content };
                setChatHistory((prev) => [...prev, chatObject]);
            });
        }
    }, [session])

    return (
        <>
            <Box display="flex" width="100vw" height="100vh" overflow="hidden">
                <Box flex="1" bg="gray.100">
                    <Box display="flex" justifyContent={"center"} mt={5} mb={4}>
                        <Image src="src/assets/NYP_AI_Text.png" width="60%" />
                    </Box>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box display="flex" justifyContent={"center"}>
                            <Box display='flex' flexDir={"column"} width="100%">
                                <Box width="90%" borderRadius={"xl"} backgroundColor="gray.200" boxShadow={"0 2px 4px 2px rgba(0.1, 0.1, 0.1, 0.1)"} mb={5} marginLeft="auto" marginRight="auto">
                                    {session ? (
                                        <Text margin={5} color="gray.600">User: {session["email"]}</Text>
                                    ) : (
                                        <Skeleton borderRadius={"xl"} height="64px" />
                                    )}
                                </Box>

                                <Card width="90%" borderRadius={"xl"} marginLeft="auto" marginRight="auto" mb={5}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" height="100%">
                                        <Text margin={3}>Answer mode</Text>
                                        <Menu>
                                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} margin={3}>
                                                {answerMode === "pipeline" ? "Pipeline" : "Direct"}
                                            </MenuButton>
                                            <MenuList>
                                                <MenuItem onClick={() => setAnswerMode('pipeline')}>Pipeline</MenuItem>
                                                <MenuItem onClick={() => setAnswerMode('direct')}>Direct</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Box>
                                </Card>

                                <Card width="90%" borderRadius={"xl"} marginLeft="auto" marginRight="auto" mb={5}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" height="100%">
                                        <Text margin={3}>Search type</Text>
                                        <Menu>
                                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} margin={3}>
                                                {searchType === "similarity" ? "Similarity" : "MMR"}
                                            </MenuButton>
                                            <MenuList>
                                                <MenuItem onClick={() => setSearchType('similarity')}>Similarity</MenuItem>
                                                <MenuItem onClick={() => setSearchType('mmr')}>MMR</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Box>
                                </Card>

                                <Card width="90%" borderRadius={"xl"} marginLeft="auto" marginRight="auto" mb={5}>
                                    <Box display="flex" justifyContent={"space-between"} alignItems="center" height="100%">
                                        <Text margin={3}>Chunks (k)</Text>
                                        <Menu>
                                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} margin={3}>
                                                {chunks}
                                            </MenuButton>
                                            <MenuList>
                                                {[...Array(10)].map((_, index) => {
                                                    const value = index + 1;
                                                    return (
                                                        <MenuItem key={value} onClick={() => setChunks(value)}>
                                                            {value}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </MenuList>
                                        </Menu>
                                    </Box>
                                </Card>

                                <Card width="90%" borderRadius={"xl"} marginLeft="auto" marginRight="auto" mb={5}>
                                    <Box display="flex" justifyContent={"space-between"} alignItems="center" height="100%">
                                        <Text margin={3}>Fetched chunks</Text>
                                        <Menu>
                                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} margin={3}>
                                                {fetchedChunks}
                                            </MenuButton>
                                            <MenuList>
                                                {[...Array(10)].map((_, index) => {
                                                    const value = index + 1;
                                                    return (
                                                        <MenuItem
                                                            key={value}
                                                            onClick={() => setFetchedChunks(value)}
                                                            isDisabled={value <= chunks}
                                                        >
                                                            {value}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </MenuList>
                                        </Menu>
                                    </Box>
                                </Card>

                                <Card width="90%" borderRadius={"xl"} marginLeft="auto" marginRight="auto">
                                    <Box display="flex" justifyContent={"space-between"} alignItems="center" height="100%">
                                        <Text margin={3}>Temperature</Text>
                                        <Menu>
                                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} margin={3}>
                                                {temperature}
                                            </MenuButton>
                                            <MenuList>
                                                {[0.0, 0.3, 0.5, 0.8, 1.0].map((temp) => (
                                                    <MenuItem key={temp} onClick={() => setTemperature(parseFloat(temp))}>
                                                        {temp}
                                                    </MenuItem>
                                                ))}
                                            </MenuList>
                                        </Menu>
                                    </Box>
                                </Card>

                                <Box display="flex" justifyContent={"center"} mt={5}>
                                    <Box
                                        width="50%"
                                        fontSize={"md"}
                                        padding="5px"
                                        textAlign={"center"}
                                        bg="white"
                                        color="#B15521"
                                        _hover={{ bg: "whitesmoke" }}
                                        _active={{ bg: "whitesmoke" }}
                                        boxShadow={"0 2px 2px 2px rgba(0.1, 0.1, 0.1, 0.1)"}
                                        cursor={"pointer"}
                                        transition={"0.2s ease-in-out"}
                                        borderRadius={"xl"}
                                        size="lg"
                                        onClick={onOpen}
                                    >
                                        Discard session
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </motion.div>
                </Box>

                <Box flex="2" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                    <Box width="95%" height="95%" borderRadius="md">
                        <Card width="100%" height="100%" borderRadius="2xl" display="flex" flexDirection="column">
                            <Box flex="1" p={4} overflowY="auto">
                                {chatHistory.map((chat, index) => (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Box
                                                display="flex"
                                                justifyContent={chat.client === "user" ? "flex-end" : "flex-start"}
                                            >
                                                <Box
                                                    bg={chat.error ? "red.300" : chat.client === "user" ? "#3171FA" : "gray.300"} // Change color if error
                                                    color={chat.error ? "white" : chat.client === "user" ? "white" : "black"}
                                                    borderRadius="xl"
                                                    p={3}
                                                    mb={2}
                                                    maxWidth="80%"
                                                >
                                                    {chat.error ? (
                                                        <Tooltip label="This message failed" aria-label='Tooltip'>
                                                            <Text>{chat.message}</Text>
                                                        </Tooltip>
                                                    ) : (
                                                        <Text>{chat.message}</Text>
                                                    )}
                                                </Box>
                                            </Box>
                                        </motion.div>
                                    </>
                                ))}
                            </Box>

                            <Box display="flex" alignItems="center" p={2}>
                                <Input placeholder="Type a message..." mr={2} borderRadius="xl" onChange={handlePromptChange} onKeyDown={handleKeyDown} value={prompt} />
                                {isSubmitting === true ? (
                                    <Button
                                        isLoading
                                        borderRadius="xl"
                                    >
                                        Send
                                    </Button>
                                ) : (
                                    <Button
                                        isDisabled={!validPrompt}
                                        color="white"
                                        bg="#3171FA"
                                        _hover={{ bg: "#275CCD" }}
                                        _active={{ bg: "#275CCD" }}
                                        borderRadius="xl"
                                        onClick={handleSubmitPrompt}
                                    >
                                        Send
                                    </Button>
                                )}
                            </Box>
                        </Card>
                    </Box>
                </Box>
            </Box>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Customer
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handleDeleteSession} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}

export default Chat;