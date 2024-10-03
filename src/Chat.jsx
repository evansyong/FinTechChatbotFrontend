/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useRef } from "react";
import { Box, Card, Text, Image, Skeleton, Input, Button, Menu, MenuButton, MenuList, MenuItem, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, useToast, Tooltip, useMediaQuery, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, SettingsIcon, InfoIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import instance from "./networking";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Chat() {
    const [session, setSession] = useState(null);
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
    const { isOpen: isInfoModalOpen, onOpen: onInfoModalOpen, onClose: onInfoModalClose } = useDisclosure()
    const cancelRef = React.useRef()
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasLoadedHistoryRef = useRef(false);

    const [prompt, setPrompt] = useState("");
    const [validPrompt, setValidPrompt] = useState(false);
    const [chatHistory, setChatHistory] = useState([{ client: "assistant", message: "Hello! How can I help you today?" }]);

    const [answerMode, setAnswerMode] = useState("pipeline"); // pipeline or direct
    const [searchType, setSearchType] = useState("similarity"); // similarity or mmr
    const [chunks, setChunks] = useState(3); // 1 to 10 (inclusive)
    const [fetchedChunks, setFetchedChunks] = useState(5); // 1 to 10 (inclusive) - MUST BE HIGHER THAN CHUNKS (k)
    const [temperature, setTemperature] = useState(parseFloat(0.0)); // 0.0, 0.3, 0.5, 0.8 OR 1.0 (1.0 is the most creative)

    const [isNarrowerThan870] = useMediaQuery("(max-width: 870px)");

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
            console.error("Failed to retrieve active session. Error: " + error.message);
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
            console.error("Failed to delete session. Error: " + error);
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
                console.error("Failed to process prompt. Error: " + submitPrompt.data);
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
                    console.error("Failed to process prompt. Error: " + submitPrompt.data);
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
            console.error("Failed to process prompt. Error: " + error);
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
        if (session !== null && !hasLoadedHistoryRef.current) {
            session["history"].forEach((chat) => {
                const chatObject = { client: chat.role, message: chat.content };
                setChatHistory((prev) => [...prev, chatObject]);
            });
            hasLoadedHistoryRef.current = true;
        }
    }, [session]);

    return (
        <>
            <Box display="flex" width="100vw" height="100vh" overflow="hidden">
                {!isNarrowerThan870 && (
                    <Box
                        flex="1"
                        bg="gray.100"
                        overflowY="scroll"
                        scrollBehavior={"smooth"}
                        sx={{
                            "&::-webkit-scrollbar": {
                                width: "10px"
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "gray.300",
                                borderRadius: "20px"

                            },
                            "&::-webkit-scrollbar-thumb:hover": {
                                backgroundColor: "gray.400"
                            }
                        }}
                    >
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
                                    <Box width="90%" marginLeft="auto" marginRight="auto" padding={3}>
                                        {session ? (
                                            <Text textAlign={"center"} mb={4} color="gray.600" isTruncated>User: {session["email"]}</Text>
                                        ) : (
                                            <Skeleton borderRadius={"xl"} height="20px" />
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
                                            width="90%"
                                            fontSize={"md"}
                                            padding="5px"
                                            textAlign={"center"}
                                            bg="#D5000A"
                                            color="white"
                                            _hover={{ bg: "#FF000D" }}
                                            _active={{ bg: "#FF000D" }}
                                            cursor={"pointer"}
                                            transition={"0.2s ease-in-out"}
                                            borderRadius={"xl"}
                                            size="lg"
                                            onClick={onOpen}
                                        >
                                            Delete my session
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </motion.div>
                    </Box>
                )}

                <Box
                    flex="2"
                    bg="gray.100"
                    display="flex"
                    flexDir={isNarrowerThan870 ? "column" : "row"}
                >
                    {isNarrowerThan870 && (
                        <Box display="flex" justifyContent={"center"} mt={5} mb={4}>
                            <Image src="src/assets/NYP_AI_Text.png" width="20%" />
                        </Box>
                    )}
                    <Box
                        width="95%"
                        height={isNarrowerThan870 ? "90%" : "95%"}
                        borderRadius="md"
                        mt={isNarrowerThan870 ? 3 : 4}
                        marginLeft="auto"
                        marginRight="auto"
                    >
                        <Card width="100%" height="100%" borderRadius="xl" display="flex" flexDirection="column" position="relative">
                            {/* Circle icon */}
                            <Button
                                top={4}
                                right={5}
                                position="absolute"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                bg="white"
                                borderRadius="full"
                                p={1}
                                cursor="pointer"
                                onClick={onInfoModalOpen}
                                boxShadow={"0 2px 4px 2px rgba(0.1, 0.1, 0.1, 0.1)"}
                                zIndex={9000}
                            >
                                <InfoIcon color="#3171FA" />
                            </Button>

                            <Box
                                flex="1"
                                p={4}
                                overflowY="scroll"
                                sx={{
                                    "&::-webkit-scrollbar": {
                                        width: "10px",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: "gray.300",
                                        borderRadius: "3xl"

                                    },
                                    "&::-webkit-scrollbar-thumb:hover": {
                                        backgroundColor: "gray.400"
                                    }
                                }}
                            >
                                {chatHistory.map((chat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Box
                                            display="flex"
                                            justifyContent={chat.client === "user" ? "flex-end" : "flex-start"}
                                        >
                                            <Box
                                                bg={chat.error ? "red.300" : chat.client === "user" ? "#3171FA" : "gray.300"}
                                                color={chat.error ? "white" : chat.client === "user" ? "white" : "black"}
                                                borderRadius="xl"
                                                p={3}
                                                paddingLeft={8}
                                                paddingRight={8}
                                                mb={4}
                                                maxWidth="80%"
                                                overflowX="hidden" // Prevent horizontal overflow
                                                whiteSpace="pre-wrap" // Allow text to wrap, including spaces and new lines
                                                wordBreak="break-word"
                                                sx={{
                                                    "& ol": {
                                                        paddingLeft: "20px", // Indentation for ordered lists
                                                        margin: 0,
                                                        listStylePosition: "inside",
                                                    },
                                                    "& li": {
                                                        marginBottom: "5px", // Space between list items
                                                    }
                                                }}
                                            >
                                                {chat.error ? (
                                                    <Tooltip label="This message failed" aria-label='Tooltip'>
                                                        <Text>{chat.message}</Text>
                                                    </Tooltip>
                                                ) : (
                                                    <Markdown remarkPlugins={[remarkGfm]}>
                                                        {chat.message}
                                                    </Markdown>
                                                )}
                                            </Box>
                                        </Box>
                                    </motion.div>
                                ))}
                            </Box>

                            <Box display="flex" alignItems="center" p={2}>
                                {isNarrowerThan870 && (
                                    <Button
                                        onClick={onModalOpen}
                                        borderRadius="xl"
                                        marginRight={2}
                                        variant="outline"
                                        bg="gray.100"
                                    >
                                        <SettingsIcon />
                                    </Button>
                                )}

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

                    {isNarrowerThan870 && session && (
                        <Text mb={3} mt={3} color="gray.600" textAlign={"center"} isTruncated>User: {session["email"]}</Text>
                    )}
                </Box>
            </Box>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={3}>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete your active session
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

            <Modal blockScrollOnMount={true} closeOnOverlayClick={true} isOpen={isModalOpen} onClose={onModalClose} isCentered>
                <ModalOverlay />
                <ModalContent margin={3}>
                    <ModalHeader>Chat configuration</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box display="flex" justifyContent={"center"}>
                            <Box display='flex' flexDir={"column"} width="100%">
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

                                <Box display="flex" justifyContent={"center"} mt={5} mb={2}>
                                    <Box
                                        width="90%"
                                        fontSize={"md"}
                                        padding="5px"
                                        textAlign={"center"}
                                        bg="#D5000A"
                                        color="white"
                                        _hover={{ bg: "#FF000D" }}
                                        _active={{ bg: "#FF000D" }}
                                        cursor={"pointer"}
                                        transition={"0.2s ease-in-out"}
                                        borderRadius={"xl"}
                                        size="lg"
                                        onClick={onOpen}
                                    >
                                        Delete my session
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal blockScrollOnMount={true} closeOnOverlayClick={true} isOpen={isInfoModalOpen} onClose={onInfoModalClose} isCentered>
                <ModalOverlay />
                <ModalContent margin={3}>
                    <ModalHeader>Important info</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text textAlign="left" mb={4}>
                            Responses generated by NYPChat may not be fully accurate, relevant or up-to-date.
                        </Text>
                        <Text textAlign="left" mb={4}>
                            The chatbot is meant to be a demonstration of the power of Retrieval Augmented Generation rather than a fully comprehensive chatbot about NYP. Please refer to relevant NYP websites online or contact the school for the most accurate and up-to-date information.
                        </Text>
                        <Text textAlign="left" mb={4}>
                            NYPChat, NYP AI and NYP does not bear any liability for negative consequences or damages incurred by the chatbot.
                        </Text>
                    </ModalBody>
                    <ModalFooter display="flex" justifyContent={"center"}>
                        <Button
                            width={"100%"}
                            borderRadius={"2xl"}
                            bg="#3171FA"
                            color="white"
                            _hover={{ bg: "#275CCD" }}
                            _active={{ bg: "#275CCD" }}
                            onClick={onInfoModalClose}
                        >
                            I understand
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default Chat;