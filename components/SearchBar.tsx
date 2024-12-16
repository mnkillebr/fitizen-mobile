import { Searchbar } from 'react-native-paper';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { debounce } from 'lodash'
import { useColorScheme } from '@/hooks/useColorScheme';

type SearchBarProps = {
  placeholder?: string;
  onSearch: (query: string) => void;
};

export function SearchBar({ placeholder = 'Search...', onSearch }: SearchBarProps) {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      onSearch(text);
    }, 300),
    [onSearch]
  );

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <Searchbar
      placeholder={placeholder}
      onChangeText={handleChangeText}
      value={searchQuery}
      onClearIconPress={handleClear}
      autoFocus={false}
      style={[styles.searchBar,
        colorScheme === "dark" ?
          {
            shadowColor: '#fff',
            backgroundColor: '#2c2c2c'
          } : {
            shadowColor: '#000',
            backgroundColor: '#f0f0f0'
          }
      ]}
      selectionColor='#ffd700'
      iconColor={colorScheme === "dark" ? "white" : "black"}
      placeholderTextColor={colorScheme === "dark" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)"}
      inputStyle={colorScheme === "dark" ? { color: 'white' } : { color: 'black' }}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  searchBar: {
    margin: 4,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
