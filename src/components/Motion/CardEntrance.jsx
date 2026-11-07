import { motion } from 'framer-motion'

/**
 * Entrance animation dùng chung cho các card/form (thay cho MUI Zoom):
 * fade + trượt nhẹ lên + scale nhỏ -> cảm giác mượt và "có chủ đích" hơn.
 * Tự động tắt khi người dùng bật Reduce Motion (qua MotionConfig ở main.jsx).
 */
function CardEntrance({ children, delay = 0.1, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default CardEntrance
