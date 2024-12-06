<template>
    <transaction-item
        :transactionHash="$route.params.transactionHash"
    />
</template>

<script>
import { mapActions } from 'vuex';
export default{
}
</script>

<style>
/* Основные стили для контейнера компонента */
template {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 16px;
    padding: 16px;
}

/* Убедитесь, что внутренности контейнера хорошо видны */
transaction-item {
    width: 100%;
    max-width: 800px;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Центрирование и добавление отступов */
template {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 16px;
}
</style>
