/* eslint-disable react/no-unescaped-entities */

import { Image, Box, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, FormControl, FormHelperText, FormLabel, Input, ModalFooter, IconButton, useToast } from "@chakra-ui/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { InfoIcon } from '@chakra-ui/icons';
import { motion } from "framer-motion"
import instance from "../src/networking"

function Home() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [email, setEmail] = useState("");
    const [validEmailInput, setValidEmailInput] = useState(false);
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

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
        setValidEmailInput(false);
        try {
            setIsSubmittingEmail(true);
            const submitEmail = await instance.post("/requestOTP", {
                email: email
            });

            if (submitEmail.data.startsWith("SUCCESS")) {
                setIsSubmittingEmail(false);
                onClose();
                navigate("/verifyOTP", { state: { email: email } }); // Pass email state for later use
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
            }
        } catch (error) {
            onClose();
            setIsSubmittingEmail(false);
            console.log("Failed to submit email. Error: " + error);
            showToast(
                "Uh-oh!",
                "An unkwon error occured",
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

    const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure();

    return (
        <>
            <Box
                display="flex"
                justifyContent="center"
                flexDirection="column"
                minHeight="100vh"
                alignItems="center"
                mt={-20}
            >
                <Image src="src/assets/NYP_AI_Text.png" width="280px" height="120px" alt="Logo" />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Text mt={8} fontSize="2xl" color="gray.600" fontFamily={"Comfortaa"}>
                        Welcome to NYPChat
                    </Text>
                </motion.div>
            </Box>

            <Box display="flex" justifyContent={"center"} mt={-20}>
                <Button
                    bg="#3171FA"
                    color="white"
                    _hover={{ bg: "#275CCD" }}
                    _active={{ bg: "#275CCD" }}
                    borderRadius={"xl"}
                    size="lg"
                    onClick={onOpen}
                >
                    Get Started
                </Button>
            </Box>

            <Modal blockScrollOnMount={true} closeOnOverlayClick={true} onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
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
                                isDisabled={!validEmailInput}
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

            <IconButton
                icon={<InfoIcon />}
                aria-label="Info"
                position="fixed"
                bottom={4}
                left={4}
                borderRadius="full"
                onClick={onInfoOpen}
                size="lg"
                bg="#3171FA"
                color="white"
                _hover={{ bg: "#2960D4" }}
                _active={{ bg: "#3171FA" }}
            />

            <Modal size="xl" blockScrollOnMount={true} closeOnOverlayClick={true} onClose={onInfoClose} isOpen={isInfoOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>About NYPChat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text mb={4}>
                            NYPChat is a fun and intuitive chatbot which you can ask anything NYP to. It was designed to demonstrate the power of Retrieval Augmented Generation. Members of the NYP AI Student Interest Group conducted Project LLM, a research project into learning the nuances of Large Language Models and coercing them to get desired output, in 2024. NYPChat is a result of this project.
                        </Text>

                        <Text mb={4}>
                            You can easily flick a few switches and dials and NYPChat will on-the-spot create retrieval chains that meet your requirements and generate an answer to your prompt. Behind the scenes, entire programmatic chains and blocks, supported by prompt templates and vectorstores, are assembled in real-time to generate answers that keep in context with the conversation.
                        </Text>

                        <Text mb={4}>
                            What are you waiting for? Try it out now!
                        </Text>
                    </ModalBody>
                    <ModalFooter display='flex' justifyContent={"center"}>
                        <Button
                            width="100%"
                            bg="#3171FA"
                            color="white"
                            _hover={{ bg: "#2960D4" }}
                            _active={{ bg: "#3171FA" }}
                            onClick={onInfoClose}
                            borderRadius={"2xl"}
                        >
                            Awesome!
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default Home;
