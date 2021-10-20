type Props = {
  value: string
}

export const StackBox = ({ value }: Props): JSX.Element | null => {
  if (value.length === 0) return null

  const parts = value.split('|')

  return (
    <table>
      <tbody>
        <tr>
          {(parts.length > 0 ? parts : [value]).map(
            (p: string, index: number) => (
              <td key={index} className="font-mono border px-2">
                {p}
              </td>
            ),
          )}
          <td className="font-mono border-t border-b border-l px-2" />
        </tr>
      </tbody>
    </table>
  )
}
