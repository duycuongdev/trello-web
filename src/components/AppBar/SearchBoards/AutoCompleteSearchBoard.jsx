import { useState, useEffect, useRef } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { fetchBoardsAPI } from '~/apis/index'
import { useDebounceFn } from '~/CustomHooks/useDebounceFn'
import { slugify } from '~/utils/formatter'
import { useTranslation } from 'react-i18next'

/**
 * Hướng dẫn & ví dụ cái Autocomplele của MUI ở đây:
 * https://mui.com/material-ui/react-autocomplete/#asynchronous-requests
 */
function AutoCompleteSearchBoard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const searchInputRef = useRef(null)

  // State xử lý hiển thị kết quả fetch về từ API
  const [open, setOpen] = useState(false)
  // State lưu trữ danh sách board fetch về được
  const [boards, setBoards] = useState(null)
  // Sẽ hiện loading khi bắt đầu gọi api fetch boards
  const [loading, setLoading] = useState(false)

  // Phím tắt bàn phím: bấm phím '/' để focus vào ô tìm kiếm, bấm 'ESC' để hủy focus
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Nếu bấm '/' khi không ở trong ô nhập liệu khác
      if (
        event.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(event.target?.tagName) &&
        !event.target?.isContentEditable
      ) {
        event.preventDefault()
        searchInputRef.current?.focus()
        setOpen(true)
      }

      // Nếu bấm 'Escape' khi đang focus vào ô tìm kiếm
      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur()
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    // Khi đóng cái phần list kết quả lại thì đồng thời clear cho boards về null
    if (!open) { setBoards(null) }
  }, [open])

  // Xử lý việc nhận data nhập vào từ input sau đó gọi API để lấy kết quả về (cần cho vào useDebounceFn như bên dưới)
  const handleInputSearchChange = (event) => {
    const searchValue = event.target?.value
    if (!searchValue) return

    // Dùng createSearchParams của react-router-dom để tạo một cái searchPath chuẩn với q[title] để gọi lên API
    const searchPath = `?${createSearchParams({ 'q[title]': searchValue })}`

    // Gọi API...
    setLoading(true)
    fetchBoardsAPI(searchPath)
      .then((res) => {
        setBoards(res.boards || [])
      })
      .finally(() => {
        setLoading(false)
      })
  }
  // Làm useDebounceFn...
  const debounceSearchBoard = useDebounceFn(handleInputSearchChange, 1000)

  // Khi chúng ta select chọn một cái board cụ thể thì sẽ điều hướng tới board đó luôn
  const handleSelectedBoard = (event, selectedBoard) => {
    // Phải kiểm tra nếu tồn tại một cái board cụ thể được select thì mới gọi điều hướng - navigate
    if (selectedBoard) {
      navigate(`/boards/${selectedBoard._id}/${selectedBoard.slug || slugify(selectedBoard.title)}`)
    }
  }

  return (
    <Autocomplete
      sx={{ width: { xs: 130, sm: 170, md: 220 } }}
      id="asynchronous-search-board"
      // Cái text này hiện ra khi boards là null hoặc sau khi đã fetch boards nhưng rỗng - không có kết quả
      noOptionsText={!boards ? t('appBar.typeToSearchBoard') : t('appBar.noBoardFound')}

      // Cụm này để handle việc đóng mở phần kết quả tìm kiếm
      open={open}
      onOpen={() => { setOpen(true) }}
      onClose={() => { setOpen(false) }}

      // getOptionLabel: để thằng Autocomplete nó lấy title của board và hiển thị ra
      getOptionLabel={(board) => board.title}

      // Options của Autocomplete nó cần đầu vào là 1 Array, mà boards của chúng ta ban đầu cần cho null để làm cái noOptionsText ở trên nên đoạn này cần thêm cái || [] vào
      options={boards || []}

      // Fix một cái warning của MUI, vì Autocomplete mặc định khi chúng ta chọn giá trị nó sẽ xảy ra sự so sánh object bên dưới, và mặc dù có 2 json objects trông như nhau trong JavaScript nhưng khi compare sẽ ra false. Vậy nên cần compare chuẩn với value dạng Primitive, ví dụ ở đây là dùng String _id thay vì compare toàn bộ cả cái json object board.
      isOptionEqualToValue={(option, value) => option._id === value._id}

      // Loading thì đơn giản rồi nhé
      loading={loading}

      // onInputChange sẽ chạy khi gõ nội dung vào thẻ input, cần làm debounce để tránh việc bị spam gọi API
      onInputChange={debounceSearchBoard}

      // onChange của cả cái Autocomplete sẽ chạy khi chúng ta select một cái kết quả (ở đây là board)
      onChange={handleSelectedBoard}

      // Render ra cái thẻ input để nhập nội dung tìm kiếm
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={searchInputRef}
          label={t('appBar.typeToSearch')}
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'white' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress sx={{ color: 'white' }} size={20} /> : null}
                {/* Phím tắt / Badge hiển thị trên desktop/tablet */}
                {params.InputProps.endAdornment}
              </>
            )
          }}
          sx={{
            '& label': { color: 'white' },
            '& input': { color: 'white' },
            '& label.Mui-focused': { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'white' },
              '&:hover fieldset': { borderColor: 'white' },
              '&.Mui-focused fieldset': { borderColor: 'white' }
            },
            '.MuiSvgIcon-root': { color: 'white' }
          }}
        />
      )}
    />
  )
}

export default AutoCompleteSearchBoard
