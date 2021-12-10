import { useEffect, useState, useContext } from 'react'

import debounce from 'lodash.debounce'
import { IOpcode } from 'types'

import { EthereumContext } from 'context/ethereumContext'

import { calculateDynamicFee } from 'util/gas'

import { Input, Radio, Icon } from 'components/ui'
import { H2 } from 'components/ui/Doc'

const debounceTimeout = 100 // ms

type Props = {
  opcode: IOpcode
}

type InputValue = {
  [name: string]: string
}

const DynamicFee = ({ opcode }: Props) => {
  const { dynamicFee } = opcode

  const { common } = useContext(EthereumContext)
  const [inputs, setInputs] = useState<InputValue>({})
  const [result, setResult] = useState('0')

  // Initialize inputs with default keys & values
  useEffect(() => {
    const inputValues: InputValue = {}
    Object.keys(dynamicFee?.inputs || []).map((key: string) => {
      if (dynamicFee?.inputs[key].type === 'number') {
        inputValues[key] = '0'
      } else if (dynamicFee?.inputs[key].type === 'boolean') {
        inputValues[key] = '1' // true default
      }
    })
    setInputs(inputValues)
  }, [dynamicFee])

  const handleCompute = debounce((inputs) => {
    if (common) {
      setResult(calculateDynamicFee(opcode, common, inputs))
    }
  }, debounceTimeout)

  const handleChange = (key: string, value: string) => {
    const newInputs = {
      ...inputs,
      [key]: value,
    }
    setInputs(newInputs)
    handleCompute(newInputs)
  }

  if (!dynamicFee?.inputs) {
    return null
  }

  return (
    <div className="w-96">
      <div className="flex justify-between items-center">
        <H2>Dynamic gas fee</H2>
        <div className="flex items-center text-right">
          <Icon name="gas-station-fill" className="text-indigo-500 mr-2" />
          {result}
        </div>
      </div>

      <div className="bg-indigo-100 dark:bg-black-500 p-4 rounded">
        {Object.keys(dynamicFee.inputs).map((key: string) => {
          const input = dynamicFee.inputs[key]

          return (
            <div key={key}>
              <label className="block text-sm text-gray-500 mb-1" htmlFor={key}>
                {input.label}
              </label>

              {input.type === 'number' && (
                <Input
                  type="number"
                  min={0}
                  max={1000000000000}
                  name={key}
                  value={inputs[key]}
                  defaultValue={'0'}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="bg-white bg-opacity-75 dark:bg-black-400 mb-4 text-sm font-mono"
                />
              )}

              {input.type === 'boolean' && (
                <div className="mb-4">
                  <Radio
                    text="Yes"
                    value={'1'}
                    isChecked={inputs[key] === '1'}
                    onChange={() => handleChange(key, '1')}
                  />
                  <Radio
                    text="No"
                    value={'0'}
                    isChecked={inputs[key] === '0'}
                    onChange={() => handleChange(key, '0')}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DynamicFee
