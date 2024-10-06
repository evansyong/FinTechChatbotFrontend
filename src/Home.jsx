/* eslint-disable react/no-unescaped-entities */

import { Image, Box, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, FormControl, FormHelperText, FormLabel, Input, ModalFooter, useToast, useMediaQuery } from "@chakra-ui/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"
import EncryptButton from "./components/EncryptButton";
import instance from "../src/networking"

function Home() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [email, setEmail] = useState("");
    const [validEmailInput, setValidEmailInput] = useState(false);
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const [isNarrowerThan890] = useMediaQuery("(max-width: 890px)");

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

    const handleGetStarted = () => {
        if (localStorage.getItem("activeSession")) {
            navigate("/chat");
            return;
        } else {
            onOpen();
        }
    }

    const handleEmailInputChange = (event) => {
        setEmail(event);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // E.g lorem@ipsum.com

        if (emailRegex.test(event)) {
            setValidEmailInput(true);
        } else {
            setValidEmailInput(false);
        }
    };

    const handleEmailSubmit = async () => {
        localStorage.setItem("OTPRequested", "true");
        setValidEmailInput(false);
        try {
            setIsSubmittingEmail(true);
            const submitEmail = await instance.post("/requestOTP", {
                email: email
            });
            if (submitEmail.data.startsWith("SUCCESS")) {
                setIsSubmittingEmail(false);
                onClose();
                navigate("/verifyOTP", { state: { email: email } });
            } else if (submitEmail.data.startsWith("UERROR")) {
                setIsSubmittingEmail(false);
                onClose();
                showToast(
                    "Uh-oh!",
                    submitEmail.data.substring("UERROR: ".length),
                    "info",
                    3500,
                    true
                );
            } else if (submitEmail.data.startsWith("ERROR")) {
                setIsSubmittingEmail(false);
                onClose();
                showToast(
                    "Uh-oh!",
                    submitEmail.data.substring("ERROR: ".length),
                    "error",
                    3500,
                    true
                );
            }
        } catch (error) {
            onClose();
            setIsSubmittingEmail(false);
            console.error("Failed to submit email. Error: " + error);
            showToast(
                "Uh-oh!",
                "An unknown error occured",
                "error",
                3500,
                true
            );

        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && validEmailInput) {
            handleEmailSubmit();
        }
    }

    return (
        <>
            <Box display="flex" width="100vw" height="100vh" overflow="hidden">
                {!isNarrowerThan890 && (
                    <Box flex="1" bg="white" display="flex" alignItems="center" justifyContent="center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Image src="src/assets/NYP_AI_Text.png" width="280px" height="120px" alt="Logo" />
                        </motion.div>
                    </Box>
                )}
        
                <Box flex="2" bg="gray.100" display="flex" flexDirection="column" justifyContent="center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box display="flex" flexDir={"column"} justifyContent={"center"} paddingLeft={10} paddingRight={10}>
                            {isNarrowerThan890 && (
                                <Box display='flex' justifyContent={"center"}>
                                    <Image src="src/assets/NYP_AI_Text.png" width="201px" height="86px" alt="Logo" />
                                </Box>
                            )}

                            <Text mt={10} fontSize="2xl" color="gray.600" fontFamily="'Comfortaa', sans-serif" mb={10} textAlign={"center"} fontWeight={"bold"}>
                                Welcome to NYPChat
                            </Text>

                            <Text mb={4} color="gray.500" textAlign={"left"}>
                                NYPChat is a fun and intuitive chatbot which you can ask anything NYP to. It was designed to demonstrate the power of Retrieval Augmented Generation. Members of the NYP AI Student Interest Group conducted Project LLM, a research project into learning the nuances of Large Language Models and coercing them to get desired output, in 2024. NYPChat is a result of this project.
                            </Text>

                            <Text mb={4} color="gray.500" textAlign={"left"}>
                                You can easily flick a few switches and dials and NYPChat will on-the-spot create retrieval chains that meet your requirements and generate an answer to your prompt. Behind the scenes, entire programmatic chains and blocks, supported by prompt templates and vectorstores, are assembled in real-time to generate answers that keep in context with the conversation.
                            </Text>

                            <Text mb={4} color="gray.500" textAlign={"center"}>
                                What are you waiting for? Try it out now! 
                            </Text>
                        </Box>
                    </motion.div>

                    <Box display="flex" justifyContent={"center"} mt={10} mb={10} className="grid min-h-[200px] place-content-center bg-neutral-900 p-4">
                        <EncryptButton onClick={handleGetStarted} />
                    </Box>
                </Box>
            </Box>

            <Modal blockScrollOnMount={true} closeOnOverlayClick={true} onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent margin={3}>
                    <ModalHeader>Let's get you started!</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel ml={1}>Your NYP email</FormLabel>
                            <Input
                                type='email'
                                placeholder="123456A@mymail.nyp.edu.sg"
                                onChange={event => handleEmailInputChange(event.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <FormHelperText ml={1}>We'll never share your email.</FormHelperText>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter display="flex" justifyContent={"center"}>
                        {isSubmittingEmail === true ? (
                            <Button
                                isLoading
                                width={"100%"}
                                borderRadius={"2xl"}
                            >
                                Proceed
                            </Button>
                        ) : (
                            <Button
                                width={"100%"}
                                onClick={handleEmailSubmit}
                                isDisabled={!validEmailInput}
                                borderRadius={"2xl"}
                                bg="#3171FA"
                                color="white"
                                _hover={{ bg: "#3171FA" }}
                                _active={{ bg: "#3171FA" }}
                            >
                                Proceed
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
    
}

export default Home;