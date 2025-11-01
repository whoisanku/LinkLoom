import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form'
import { CONSTANTS } from '../constant/data.const'
import TextField from '@/components/ui/TextField'
import { useDebounce } from '@/utils/Debounce';

type SearchProps = {
  type: 'target' | 'introducer',
  getSearchQuery: (value: string) => void
};

const Search = ({ type, getSearchQuery }: SearchProps) => {

  const methods = useForm<{ search: string }>({
    defaultValues: { search: '' },
  })

  const searchValue = useDebounce(methods.watch('search'));

  useEffect(() => {
    if (!searchValue || searchValue.trim().length < 3) return
    getSearchQuery(searchValue)
  }, [searchValue, getSearchQuery])


  const placeholder =
    type === 'introducer'
      ? CONSTANTS.SEARCH.PLACEHOLDER.INTRODUCER
      : CONSTANTS.SEARCH.PLACEHOLDER.TARGET


  return (
    <div className="relative w-full ">
      <div className="flex flex-col gap-3 rounded-md ">
        <FormProvider {...methods}>
          <form>
            <div className="w-full">
              <TextField
                name="search"
                placeholder={placeholder}
                customLabel=""
                type="search"
              />
            </div>
          </form>
        </FormProvider>
      </div>

    </div>
  )
}

export default Search
