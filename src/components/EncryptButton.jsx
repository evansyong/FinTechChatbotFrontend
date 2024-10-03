/* eslint-disable react/prop-types */

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Box, Button } from "@chakra-ui/react";

const TARGET_TEXT = "Get Started";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;

const CHARS = "*************************";

const EncryptButton = ({ onClick }) => {
    const intervalRef = useRef(null);
    const [text, setText] = useState(TARGET_TEXT);

    const scramble = () => {
        let pos = 0;

        intervalRef.current = setInterval(() => {
            const scrambled = TARGET_TEXT.split("")
                .map((char, index) => {
                    if (pos / CYCLES_PER_LETTER > index) {
                        return char;
                    }

                    const randomCharIndex = Math.floor(Math.random() * CHARS.length);
                    const randomChar = CHARS[randomCharIndex];

                    return randomChar;
                })
                .join("");

            setText(scrambled);
            pos++;

            if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
                stopScramble();
            }
        }, SHUFFLE_TIME);
    };

    const stopScramble = () => {
        clearInterval(intervalRef.current || undefined);
        setText(TARGET_TEXT);
    };

    return (
        <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.975 }}>
            <Button
                minWidth="180px"
                width="180px"
                onMouseEnter={scramble}
                onMouseLeave={stopScramble}
                onClick={onClick}
                borderRadius="xl"
                bg="#3171FA"
                color="white"
                _hover={{ bg: "#3171FA" }}
                _active={{ bg: "#3171FA" }}
                position="relative"
                overflow="hidden"
                fontFamily="'Hackdaddy', sans-serif"
            >
                <Box zIndex={1}>{text}</Box>
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "-100%" }}
                    transition={{
                        repeat: Infinity,
                        repeatType: "mirror",
                        duration: 1,
                        ease: "linear",
                    }}
                    className="chakra-gradient-bg" // Chakra UI doesn't have tailwind classes, so use Chakra's Box
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(66, 153, 225, 0) 40%, rgba(66, 153, 225, 1) 100%)",
                        opacity: 0,
                    }}
                />
            </Button>
        </motion.div>
    );
};

export default EncryptButton;