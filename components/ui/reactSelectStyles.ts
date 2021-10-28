export const baseSelectStyles = {
  control: (provided: {}) => ({
    ...provided,
    minHeight: 32,
    height: 32,
    border: 'none',
    background: 'none',
    boxShadow: 'none',
  }),
  valueContainer: (provided: {}) => ({
    ...provided,
    padding: '0 4px 0 0',
  }),
  singleValue: (provided: {}) => ({
    ...provided,
    padding: 0,
  }),
  input: (provided: {}) => ({
    ...provided,
  }),
  indicatorSeparator: () => ({}),
  dropdownIndicator: (provided: {}) => ({
    ...provided,
    padding: '0 8px 0 0',
  }),
  menu: (
    provided: {},
    { selectProps: { menuWidth } }: { selectProps: { menuWidth: number } },
  ) => ({
    ...provided,
    border: 'none',
    borderRadius: 4,
    minWidth: menuWidth || 104,
  }),
  menuList: (provided: {}) => ({
    ...provided,
    background: '#FFFFFF',
    borderRadius: 4,
  }),
  option: (provided: {}, state: any) => ({
    ...provided,
    '&:hover': { background: '#E5E7EB' },
    padding: '6px 16px',
    background: state.isSelected ? '#E5E7EB' : 'transparent',
    fontWeight: '400',
    color: '#000000',
  }),
}
