// TODO: make more generic components such as this
const ContractViewerHeader = ({ children }: any) => {
  return (
    <div className="w-full p-2 bg-gray-100 dark:bg-black-700 pr-6 h-16">
      {children}
    </div>
  )
}

export default ContractViewerHeader
