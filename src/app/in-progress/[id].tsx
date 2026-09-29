import { useCallback, useState } from 'react';

import { Alert, View, StatusBar } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';

import dayjs, { Dayjs } from 'dayjs';

import { List } from '@/components/List';
import { Button } from '@/components/Button';
import { Progress } from '@/components/Progress';
import { Loading } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { Transaction, TransactionProps } from '@/components/Transaction';

import { TransactionTypes } from '@/utils/TransactionTypes';

import { useTargetDataBase } from '@/database/useTargetDataBase';
import { useTransactionsDataBase } from '@/database/useTransactionsDatabase';
import { numberToCurrency } from '@/utils/numberToCurrency';

export default function InProgress() {
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [details, setDetails] = useState({
    name: '',
    current: 'R$ 0,00',
    target: 'R$ 0,00',
    percentage: 0,
  });

  const params = useLocalSearchParams<{ id: string }>();

  const targetDataBase = useTargetDataBase();
  const transactionsDataBase = useTransactionsDataBase();

  async function fetchTargetDetails() {
    try {
      const response = await targetDataBase.show(Number(params.id));

      if (!response) {
        return Alert.alert('Erro', 'Meta não encontrada.');
      }

      setDetails({
        name: response.name,
        current: numberToCurrency(response.current),
        target: numberToCurrency(response.amount),
        percentage: response.percentage,
      });
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao buscar os detalhes da meta. Tente novamente.');
      console.log(error);
    }
  }

  async function fetchTransactions() {
    try {
      const response = await transactionsDataBase.listByTargetId(Number(params.id));
      setTransactions(
        response.map((item) => ({
          id: String(item.id),
          value: numberToCurrency(item.amount),
          date: dayjs(item.created_at).format('DD/MM/YYYY [às] HH:mm'),
          description: item.observation,
          type: item.amount < 0 ? TransactionTypes.Output : TransactionTypes.Input,
        })),
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possivel carregar as transações.');
      console.log(error);
    }
  }

  async function fetchData() {
    const fetchDetailsPromise = fetchTargetDetails();
    const fetchTransactionsPromise = fetchTransactions();

    await Promise.all([fetchDetailsPromise, fetchTransactionsPromise]);
    setIsFetching(false);
  }

  function handleTransactionRemove(id: string) {
    Alert.alert('Remover', 'Deseja realmente remover?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: () => transactionRemove(id),
      },
    ]);
  }

  async function transactionRemove(id: string) {
    try {
      await transactionsDataBase.remove(Number(id));
      fetchData();
      Alert.alert('Transação', 'Transação removida com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possivel remover a transação.');
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  if (isFetching) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 32 }}>
      <StatusBar barStyle="dark-content" />
      <PageHeader
        title={details.name}
        rightButton={{
          icon: 'edit',
          onPress: () => router.navigate(`/target?id=${params.id}`),
        }}
      />

      <Progress data={details} />

      <List
        title="Transações"
        data={transactions}
        renderItem={({ item }) => (
          <Transaction data={item} onRemove={() => handleTransactionRemove(item.id)} />
        )}
        emptyMessage="Nenhuma transação encontrada. Toque em nova transação para guardar seu primeiro dinheiro aqui."
      />

      <Button title="Nova Transação" onPress={() => router.navigate(`/transaction/${params.id}`)} />
    </View>
  );
}
