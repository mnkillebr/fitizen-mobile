import { FlatList, ActivityIndicator, View, RefreshControl } from 'react-native';
import { SearchBar } from './SearchBar';
import { SkeletonItem } from './SkeletonItem';
import { Skeleton } from '@rneui/themed';

type InfiniteListProps<T> = {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactNode;
  onSearch: (query: string) => void;
  onLoadMore: () => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  searchPlaceholder?: string;
  ListEmptyComponent?: React.ReactNode;
  keyExtractor: (item: T) => string;
  refetch: () => void;
  isRefetching: boolean;
};

export function InfiniteList<T>({
  data,
  renderItem,
  onSearch,
  onLoadMore,
  isLoading,
  isFetchingNextPage,
  searchPlaceholder,
  ListEmptyComponent,
  keyExtractor,
  refetch,
  isRefetching,
}: InfiniteListProps<T>) {
  if (isLoading) {
    return (
      <FlatList
        data={[1, 2, 3, 4, 5]}
        renderItem={() => <Skeleton height={224} />}
        keyExtractor={(item) => item.toString()}
      />
    );
  }

  return (
    <View className='h-full'>
      <SearchBar
        placeholder={searchPlaceholder}
        onSearch={onSearch}
      />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ padding: 16 }} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}