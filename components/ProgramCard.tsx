import React from "react";
import { View, Text, ImageBackground, StyleSheet, Pressable } from "react-native";

type ProgramCardProps = {
  s3ImageKey: string;
  name: string;
  difficulty?: string;
  placeholder?: string;
  opacity?: number;
}

export default function ProgramCard({ s3ImageKey, name, difficulty = "Beginner", placeholder, opacity = 1 }: ProgramCardProps) {
  return (
    <View className="h-56 relative rounded-lg bg-slate-50 overflow-hidden my-2">
      <ImageBackground
        source={{ uri: s3ImageKey }}
        style={styles.backgroundImage}
        imageStyle={{ opacity }}
      >
        {/* Top Left Text */}
        <View className="absolute top-2 left-2 p-2 flex flex-col items-start">
          <Text className="font-bold text-white">{name}</Text>
          <View className="flex flex-row gap-2">
            <Text className="text-white">Difficulty:</Text>
            <Text className="italic text-white">{difficulty}</Text>
          </View>
        </View>

        {/* Centered Text */}
        {placeholder ? (
          <Text className="absolute text-white font-semibold text-4xl text-center self-center">
            {placeholder}
          </Text>
        ) : null}

        {/* Bottom Right Button */}
        <View className="absolute bottom-0 right-0 w-1/3 h-1/4 flex justify-center">
          <View className="bg-[#ffd700] text-slate-900 font-bold rounded-tl-lg rounded-br-lg w-full h-full flex items-center justify-center">
            <Text className="select-none font-bold">Go →</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
});
