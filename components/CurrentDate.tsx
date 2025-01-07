import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

type CurrentDateProps = {
  className?: string;
 incomingDate?: string;
 style?: TextStyle;
}

export default function CurrentDate({ className, incomingDate, style }: CurrentDateProps) {
 const [currentDate, setCurrentDate] = useState('');

 useEffect(() => {
   const now = incomingDate ? new Date(incomingDate) : new Date();
   const formattedDate = now.toLocaleDateString('en-US', {
     weekday: 'short',
     day: 'numeric', 
     month: 'short',
     year: '2-digit',
     hour: 'numeric',
     minute: 'numeric',
     hour12: true
   });

   setCurrentDate(formattedDate);
 }, [incomingDate]);

 return <Text className={className} style={style}>{currentDate}</Text>;
}