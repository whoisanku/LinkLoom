import { useEffect, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form'
import { CONSTANTS } from '../constant/data.const'
import TextField from '@/components/ui/TextField'
import { useDebounce } from '@/utils/Debounce';
import type { TMode } from '../type/data';

type SearchProps = {
  type: TMode,
  getSearchQuery: (value: string) => void
};

const Search = ({ type, getSearchQuery }: SearchProps) => {
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

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-3 rounded-md">
        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
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
