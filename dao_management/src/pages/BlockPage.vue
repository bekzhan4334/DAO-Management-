<template>
    <block-item
        :blockNumberOrHash="$route.params.blockNumberOrHash"
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
    background-color: #f9f9f9;
}

/* Убедитесь, что внутренности контейнера хорошо видны */
block-item {
    width: 100%;
    max-width: 800px;
}
</style>
