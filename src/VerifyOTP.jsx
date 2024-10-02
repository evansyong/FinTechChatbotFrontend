/* eslint-disable react/no-unescaped-entities */

import { Box, Button, Heading, Input, Text, VStack, Image } from '@chakra-ui/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const VerifyOtpCard = () => {
    const [isSubmittingOTP, setIsSubmittingOTP] = useState(false);

    const handleOTPSubmit = () => {
        setIsSubmittingOTP(true);
        // Make networking call to verify OTP endpoint
        // try-catch and error handling
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
                            height="100px"
                        />

                        <Heading as="h2" fontSize={"23px"} textAlign="center" fontFamily={"Comfortaa"} fontWeight={"bold"}>
                            You're almost there!
                        </Heading>

                        <Text textAlign="center">
                            Please enter the OTP sent to your email
                        </Text>

                        <Input placeholder="Enter OTP" />

                        {isSubmittingOTP === true ? (
                            <Button
                                isLoading
                                width={"100%"}
                                onClick={handleOTPSubmit}
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
