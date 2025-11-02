import { useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import { FormProvider, useForm } from 'react-hook-form'
import { CONSTANTS } from '../constant/data.const'
import TextField from '@/components/ui/TextField'
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

  const searchValue = methods.watch('search');

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
    <div className='text-xl p-1.5 mx-auto my-auto rounded-full border-0 bg-white text-black font-bold'> {ICONS.search} </div>
  )

  return (
    <div className="relative flex flex-col gap-4 w-full">
      <Heading variant={'h2'} title={CONSTANTS.TITLE.SEARCH} color='white' className='justify-center text-center'/>
      <div className="flex flex-col gap-3">
        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="w-full flex rounded-full bg-primary">
              <TextField
                name="search"
                placeholder={placeholder}
                customLabel=""
                disabled={isLoading}
              />
            {searchValue ?   (<Button className='rounded-full' onClick={() => setIsLoading(true)}>
                {searchValue ? searchIcon : ""}
              </Button>) : ""}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default Search
