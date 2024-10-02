/* eslint-disable react/no-unescaped-entities */

import { Box, Button, Heading, Input, Text, VStack, Image, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import instance from './networking';

const VerifyOtpCard = () => {
    const [otp, setOtp] = useState("");
    const [isSubmittingOTP, setIsSubmittingOTP] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

    const { email } = location.state;

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

    const handleOTPInputChange = (event) => {
        setOtp(event);
    }

    const handleOTPSubmit = async () => {
        setIsSubmittingOTP(true);
        try {
            const submitOTP = await instance.post("/verifyOTP", {
                email: email,
                otpCode: otp
            });
            if (submitOTP.data.startsWith("SUCCESS")) {
                setIsSubmittingOTP(false);
                navigate("/chat"); 
            } else if (submitOTP.data.startsWith("UERROR")) {
                setIsSubmittingOTP(false);
                showToast(
                    "Uh-oh!",
                    submitOTP.data.substring("UERROR: ".length),
                    "warning",
                    3500,
                    true
                );
            } else if (submitOTP.data.startsWith("ERROR")) {
                setIsSubmittingOTP(false);
                showToast(
                    "Uh-oh!",
                    submitOTP.data.substring("ERROR: ".length),
                    "warning",
                    3500,
                    true
                );
            }
        } catch (error) {
            setIsSubmittingOTP(false);
            console.log("Failed to verify OTP. Error: " + error);
            showToast(
                "Uh-oh!",
                "An unknown error occurred",
                "warning",
                3500,
                true
            );
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleOTPSubmit();
        }
    }

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
                minHeight="90vh"
            >
                <Box
                    w="md"
                    p={8}
                    borderRadius="lg"
                    boxShadow={"0 2px 4px 2px rgba(0.1, 0.1, 0.1, 0.1)"}
                >
                    <VStack spacing={4} align="stretch">
                        <Image 
                            src="../src/assets/NYP_AI_Text.png"
                            alt="OTP Verification"
                            mx="auto"
                            width="280px"
                            height="120px"
                        />

                        <Heading as="h2" fontSize={"23px"} textAlign="center" fontFamily={"Comfortaa"} fontWeight={"bold"}>
                            You're almost there!
                        </Heading>

                        <Text textAlign="center">
                            Please enter the OTP sent to your email
                        </Text>

                        <Input placeholder="Enter OTP" onChange={event => handleOTPInputChange(event.target.value)} onKeyDown={handleKeyDown} />

                        {isSubmittingOTP === true ? (
                            <Button
                                isLoading
                                width={"100%"}
                                borderRadius={"2xl"}
                            >
                                Verify
                            </Button>
                        ) : (
                            <Button
                                width={"100%"}
                                onClick={handleOTPSubmit}
                                borderRadius={"2xl"}
                                bg="#3171FA"
                                color="white"
                                _hover={{ bg: "#3171FA" }}
                                _active={{ bg: "#3171FA" }}
                            >
                                Verify
                            </Button>
                        )}
                    </VStack>
                </Box>
            </Box>
        </motion.div>
    );
};

export default VerifyOtpCard;
