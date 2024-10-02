/* eslint-disable react/no-unescaped-entities */
import { Image, Box, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, FormControl, FormHelperText, FormLabel, Input, ModalFooter, useToast } from "@chakra-ui/react"
import { useState } from "react"
import instance from "../src/networking"

function Home() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [email, setEmail] = useState("");
    const [validEmailInput, setValidEmailInput] = useState(false);
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
    const toast = useToast();

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
        const emailRegex = /^[a-zA-Z0-9._%+-]+@mymail.nyp.edu.sg$/

        if (emailRegex.test(event)) {
            setValidEmailInput(true);
        } else {
            setValidEmailInput(false);
        }
    }

    const handleEmailSubmit = async () => {
        setValidEmailInput(false);
        try {
            setIsSubmittingEmail(true);
            const submitEmail = await instance.post("/requestOTP", {
                email: email
            });

            if (submitEmail.status === 200) {
                setIsSubmittingEmail(false);
                onClose();
                // SUCCESS. Redirect to OTP Verification Page
            }
        } catch (error) {
            setIsSubmittingEmail(false);
            if (error.response && error.response.data && typeof error.response.data == "string") {
                console.log("Failed to submit email; response: " + error.response.data);
                if (error.response.data.startsWith("UERROR")) {
                    showToast(
                        "Uh-oh!",
                        error.response.data.substring("UERROR: ".length),
                        "info",
                        3500,
                        true
                    );
                } else {
                    onClose();
                    showToast(
                        "Something went wrong",
                        "Failed to submit your email. Please try again",
                        "error",
                        3500,
                        true
                    );
                }
            } else {
                onClose();
                console.log("Unknown error occurred when attempting to submit email; error: " + error);
                showToast(
                    "Something went wrong",
                    "Failed to submit your email. Please try again",
                    "error",
                    3500,
                    true
                );
            }
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && validEmailInput) {
            handleEmailSubmit();
        }
    }

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

                <Text mt={8} fontSize="2xl" color="gray.600" fontFamily={"Comfortaa"}>
                    Welcome to NYPChat
                </Text>
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
                                onClick={handleEmailSubmit}
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
        </>
    )
}

export default Home;
