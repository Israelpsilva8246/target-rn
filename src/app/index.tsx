import { useCallback, useState } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { List } from '@/components/List';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { HomeHeader, HomeHeaderProps } from '@/components/HomeHeader';
import { Target, TargetProps } from '@/components/Target';

import { numberToCurrency } from '@/utils/numberToCurrency';

import { useTargetDataBase } from '@/database/useTargetDataBase';
import { useTransactionsDataBase } from '@/database/useTransactionsDatabase';

export default function Index() {
  const [summary, setSummary] = useState<HomeHeaderProps>();
  const [isFetching, setIsFetching] = useState(true);
  const [targets, setTargets] = useState<TargetProps[]>([]);

  const targetDataBase = useTargetDataBase();
  const transactionsDatabase = useTransactionsDataBase();

  async function fetchTargets(): Promise<TargetProps[]> {
    try {
      const response = await targetDataBase.listByClosestTarget();

      return response.map((item) => ({
        id: String(item.id),
        name: item.name,
        percentage: item.percentage.toFixed(0) + '%',
        current: numberToCurrency(item.current),
        target: numberToCurrency(item.amount),
      }));
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao buscar as metas. Tente novamente.');
      console.log(error);
      return [];
    }
  }

  async function fetchSummary(): Promise<HomeHeaderProps | undefined> {
    try {
      const response = await transactionsDatabase.summary();

      const input = response?.input ?? 0;
      const output = response?.output ?? 0;

      return {
        total: numberToCurrency(input + output),
        input: {
          label: 'Entradas',
          value: numberToCurrency(input),
        },
        output: {
          label: 'Saídas',
          value: numberToCurrency(output),
        },
      };
    } catch (error) {
      Alert.alert('Erro', 'Não foi possivel carregar o resumo.');
      console.log(error);
    }
  }

  async function fetchData() {
    const targetDataPromise = fetchTargets();
    const dataSummaryPromise = fetchSummary();

    const [targetData, dataSummary] = await Promise.all([targetDataPromise, dataSummaryPromise]);
    setTargets(targetData);
    setSummary(dataSummary);
    setIsFetching(false);
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  if (isFetching || !summary) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader data={summary} />

      <List
        title="Metas"
        data={targets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Target data={item} onPress={() => router.navigate(`/in-progress/${item.id}`)} />
        )}
        emptyMessage="Nenhuma meta. Toque em nova meta para criar."
        containerStyle={{ paddingHorizontal: 24 }}
      />

      <View style={{ padding: 24, paddingBottom: 32 }}>
        <Button title="Nova meta" onPress={() => router.navigate('/target')} />
      </View>
    </View>
  );
}
