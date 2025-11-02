import { useEffect, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form'
import { CONSTANTS } from '../constant/data.const'
import TextField from '@/components/ui/TextField'
import { useDebounce } from '@/utils/Debounce';
import type { TMode } from '../type/data';
import Heading from '@/components/ui/Typography';
import { ICONS } from '@/assets/icons/Icon';
import Button from '@/components/ui/Button';

type SearchProps = {
  type: TMode,
  getSearchQuery: (value: string) => void
  isLoading: boolean,
  setIsLoading: Dispatch<SetStateAction<boolean>>
};

const Search = ({ type, getSearchQuery, isLoading, setIsLoading }: SearchProps) => {

  const methods = useForm<{ search: string }>({
    defaultValues: { search: '' },
  })

  const searchValue = useDebounce(methods.watch('search'));

  const handleSearch = useCallback((value: string) => {
    getSearchQuery(value);
  }, [getSearchQuery]);

  useEffect(() => {
    // If search is empty or less than 3 characters, clear the search
    if (!searchValue || searchValue.trim().length === 0) {
      handleSearch('');
      return;
    }

    // Only search if 3 or more characters
    if (searchValue.trim().length < 3) return;

    handleSearch(searchValue);
  }, [searchValue, handleSearch]);

  const placeholder =
    type === 'introducer'
      ? CONSTANTS.SEARCH.PLACEHOLDER.INTRODUCER
      : CONSTANTS.SEARCH.PLACEHOLDER.TARGET;


  const searchIcon = (
    <div className='text-xl p-2 border mx-auto my-auto rounded-full bg-white text-black font-bold'> {ICONS.search} </div>
  )

  return (
    <div className="relative w-full">
      <Heading variant={'h2'} title={'What are you looking for?'} color='white' />
      <div className="flex flex-col gap-3 rounded-md">
        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="w-full flex bg-primary">
              <TextField
                name="search"
                placeholder={placeholder}
                customLabel=""
                type="search"
                disabled={isLoading}
              />
              <Button onClick={() => setIsLoading(true)}>
                {searchValue ? searchIcon : ""}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default Search
