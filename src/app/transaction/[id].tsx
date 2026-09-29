import { useState } from 'react';
import { Button } from '@/components/Button';
import { CurrencyInput } from '@/components/CurrencyInput';
import { Input } from '@/components/Input';
import { PageHeader } from '@/components/PageHeader';
import { TransactionType } from '@/components/TransactionType';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View, StatusBar } from 'react-native';
import { TransactionTypes } from '@/utils/TransactionTypes';

import { useTransactionsDataBase } from '@/database/useTransactionsDatabase';

export default function Transaction() {
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState(TransactionTypes.Input);
  const [isCreating, setIsCreating] = useState(false);
  const [observation, setObservation] = useState('');

  const params = useLocalSearchParams<{ id: string }>();

  const transactionsDataBase = useTransactionsDataBase();

  async function handleCreate() {
    try {
      if (amount <= 0) {
        return Alert.alert('Atenção!', 'Preencha o valor. A transação deve ser maior que zero.');
      }

      setIsCreating(true);

      await transactionsDataBase.create({
        target_id: Number(params.id),
        amount: type === TransactionTypes.Output ? amount * -1 : amount,
        observation,
      });

      Alert.alert('Sucesso', 'Transação salva com sucesso!', [
        {
          text: 'ok',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possivel salvar a transação.');
      console.log(error);
      setIsCreating(false);
    }
  }
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <StatusBar barStyle="dark-content" />
      <PageHeader
        title="Nova transação"
        subtitle="A cada valor guardado você fica mais próximo da sua meta. Se esforce para guardar e evitar retirar."
      />

      <View style={{ marginTop: 32, gap: 24 }}>
        <TransactionType selected={type} onChange={setType} />
        <CurrencyInput
          label="Valor (R$)"
          value={amount}
          onChangeValue={(value) => setAmount(value ?? 0)}
        />
        <Input
          label="Motivo (opcional)"
          placeholder="Ex: Investir em CDB de 110% no banco XPTO"
          onChangeText={setObservation}
        />
        <Button title="Salvar" onPress={() => handleCreate()} isProcessing={isCreating} />
      </View>
    </View>
  );
}
