import { useState, useEffect, useId } from 'react'
import TextField from '@mui/material/TextField'

// Một Trick xử lý css khá hay trong việc làm UI UX khi cần ẩn hiện một cái input: Hiểu đơn giản là thay vì phải tạo biến State để chuyển đổi qua lại giữa thẻ Input và Text thông thường thì chúng ta sẽ CSS lại cho cái thẻ Input trông như text bình thường, chỉ khi click và focus vào nó thì style lại trở về như cái input ban đầu.
// Controlled Input trong MUI: https://mui.com/material-ui/react-text-field/#uncontrolled-vs-controlled
function ToggleFocusInput({ value, onChangedValue, inputFontSize = '16px', ...props }) {
  const inputId = useId()
  const [inputValue, setInputValue] = useState(value)

  // Đồng bộ inputValue khi props value thay đổi từ bên ngoài (Realtime Socket / Redux update)
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Blur là khi chúng ta không còn Focus vào phần tử nữa thì sẽ trigger hành động ở đây.
  const triggerBlur = () => {
    const trimmed = inputValue.trim()

    // Nếu giá trị không có gì thay đổi hoặc nếu user xóa hết nội dung thì set lại giá trị gốc ban đầu theo value từ props và return luôn không làm gì thêm
    if (!trimmed || trimmed === value) {
      setInputValue(value)
      return
    }

    // Khi giá trị có thay đổi ok thì gọi lên func ở Props cha để xử lý (đã trim)
    setInputValue(trimmed)
    onChangedValue(trimmed)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.target.blur()
    }
  }

  return (
    <TextField
      id={inputId}
      fullWidth
      variant='outlined'
      size="small"
      value={inputValue}
      onChange={(event) => { setInputValue(event.target.value) }}
      onBlur={triggerBlur}
      onKeyDown={handleKeyDown}
      {...props}
      sx={{
        '& label': {},
        '& input': { fontSize: inputFontSize, fontWeight: 'bold' },
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'transparent',
          '& fieldset': { borderColor: 'transparent' }
        },
        '& .MuiOutlinedInput-root:hover': {
          borderColor: 'transparent',
          '& fieldset': { borderColor: 'transparent' }
        },
        '& .MuiOutlinedInput-root.Mui-focused': {
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : 'white',
          '& fieldset': { borderColor: 'primary.main' }
        },
        '& .MuiOutlinedInput-input': {
          px: '6px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }
      }}
    />
  )
}

export default ToggleFocusInput
