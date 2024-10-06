/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import { Box, Button, Heading, Input, Text, VStack, Image, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import instance from './networking';

const VerifyOtpCard = () => {
    const [otp, setOtp] = useState("");
    const [isSubmittingOTP, setIsSubmittingOTP] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [countdown, setCountdown] = useState(30);
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

    const { email } = location.state || "";

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
                localStorage.removeItem("OTPRequested");
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
            console.error("Failed to verify OTP. Error: " + error);
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

    const handleResendOTP = async () => {
        try {
            localStorage.setItem("OTPRequested", "true");
            const resendOTP = await instance.post("/requestOTP", {
                email: email
            });

            if (resendOTP.data.startsWith("SUCCESS")) {
                showToast("Success", "A new OTP has been sent to your email.", "success", 3500, true);
                const currentTime = Date.now();
                localStorage.setItem("resendOTPTime", currentTime);
                setIsResendDisabled(true);
                setCountdown(30);
                return;
            } else if (resendOTP.data.startsWith("UERROR")) {
                showToast(
                    "Uh-oh!",
                    resendOTP.data.substring("UERROR: ".length),
                    "info",
                    3500,
                    true
                );
            } else if (resendOTP.data.startsWith("ERROR")) {
                showToast(
                    "Uh-oh!",
                    resendOTP.data.substring("ERROR: ".length),
                    "error",
                    3500,
                    true
                );
            }
        } catch (error) {
            console.error("Failed to resend OTP. Error: " + error);
            showToast("Uh-oh!", "An unknown error occurred", "error", 3500, true);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("OTPRequested") || localStorage.getItem("OTPRequested") !== "true") {
            console.log("Access denied. Redirecting to home page.");
            navigate("/");
        } else {
            const currentTime = Date.now();
            if (!localStorage.getItem("resendOTPTime")) {
                localStorage.setItem("resendOTPTime", currentTime);
            }
        }
    }, []);

    useEffect(() => {
        const storedTime = localStorage.getItem("resendOTPTime");
        if (storedTime) {
            const timePassed = Math.floor((Date.now() - parseInt(storedTime)) / 1000);
            const remainingTime = 30 - timePassed;
            if (remainingTime > 0) {
                setCountdown(remainingTime);
                setIsResendDisabled(true);
            } else {
                setCountdown(0);
                setIsResendDisabled(false);
            }
        } else {
            setIsResendDisabled(false);
        }

        let timer;
        if (isResendDisabled && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev === 1) {
                        clearInterval(timer);
                        setIsResendDisabled(false);
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [countdown, isResendDisabled]);

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
                    w="sm"
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

                        <Text 
                            textAlign={"center"} 
                            color={isResendDisabled ? "gray" : "blue"} 
                            sx={{ cursor: isResendDisabled ? "default" : "pointer" }}
                            onClick={!isResendDisabled ? handleResendOTP : null}
                        >
                            {isResendDisabled ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                        </Text>

                        <Input placeholder="Enter OTP" onChange={event => handleOTPInputChange(event.target.value)} onKeyDown={handleKeyDown} />

                        {isSubmittingOTP ? (
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
