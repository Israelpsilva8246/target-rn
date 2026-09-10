import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Button } from "react-native";

export default function Transaction() {
  const params = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>ID: {params.id}</Text>

      <Button title="voltar" onPress={() => router.back()} />
    </View>
  );
}
