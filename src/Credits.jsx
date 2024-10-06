import { Box, Flex, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

function Credits() {
    return (
        <Box
            bg="gray.100"
            mb={-20}
            minHeight="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
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
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: "gray.100",
                    borderRadius: "20px"
                }
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Text textAlign={"center"} fontSize="4xl" fontWeight="bold" mb={10} color="gray.500" fontFamily="'Hackdaddy', sans-serif">
                    Credits
                </Text>

                <Box mb={20}>
                    <Flex
                        direction={["column", "column", "row"]}
                        justify="center"
                        align="center"
                        gap={12}
                    >
                        <Box textAlign="center">
                            <Text fontSize="xl" fontWeight="semibold" color="#3171FA" cursor="pointer" _hover={{ color: "#2C65E1" }} onClick={() => window.location.href = "https://www.linkedin.com/in/prakhartrivedi0706?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"}>
                                Prakhar Trivedi
                            </Text>
                            <Text fontSize="md" color="gray.500">
                                NYP AI Vice-President, Class of 2026
                            </Text>
                            <Text fontSize="md" color="gray.500">
                                Backend Developer
                            </Text>
                        </Box>

                        <Box textAlign="center">
                            <Text fontSize="xl" fontWeight="semibold" color="#3171FA" cursor="pointer" _hover={{ color: "#2C65E1" }} onClick={() => window.location.href = "https://www.linkedin.com/in/joshua-long-1a21ba257?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"}>
                                Joshua Long
                            </Text>
                            <Text fontSize="md" color="gray.500">
                                NYP AI Subcommittee, Class of 2026
                            </Text>
                            <Text fontSize="md" color="gray.500">
                                Frontend Developer
                            </Text>
                        </Box>
                    </Flex>
                </Box>

                <Text fontFamily="'Comfortaa', sans-serif" textAlign={"center"} color="gray.600">Made with ❤️ by NYP AI</Text>
            </motion.div>
        </Box>
    );
}

export default Credits;
