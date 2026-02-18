import {motion} from "framer-motion";

const PageTransitions = ({children}) => {
    return (
        <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.5, ease: "easeOut"}}
        >
            {children}
        </motion.div>
    );
}

export default PageTransitions;