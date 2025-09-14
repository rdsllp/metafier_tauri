import {styled, Autocomplete} from '@mui/material';

export const DolbyAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '&.Mui-disabled': {
    color: 'rgba(255, 255, 255, 0.38)'
  },
  '& .MuiSelect-select': {
    padding: '0 5px'
  },
  '&.Mui-disabled .MuiSelect-select': {
    textFillColor: 'rgba(255, 255, 255, 0.38)'
  },
  '&.Mui-disabled .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.38)'
  },
  '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.38)'
  },
  '& .MuiSvgIcon-root': {
    color: 'white'
  }
}));