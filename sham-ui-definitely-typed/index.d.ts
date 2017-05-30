import {Widget} from "sham-ui";
/**
 * Deferred на нативных Promise
 */
class Deferred {
    promise: Promise<any>;
    resolve();
    reject();
}

type StringFunction = () => any;

/**
 * Default options
 */
interface Options {
    /**
     * Сначала биндим обработчики событий, потом отрисовываем
     * @default [ "bindEvents", "render" ]
     */
    actionSequence: string[];
    /**
     * Тип виджета
     */
    types: string[];

    /**
     * Если биндим обработчики событий после отрисовки, то нужно ли перебиндиивать их
     * после каждой отрисовки
     * @default true
     */
    bindOnce: boolean;

    /**
     * Нужно ли кэшировать родительский элемент для контейнера
     * @default false
     */
    cacheParentContainer: boolean;

    /**
     * Массив виджетов, которые нужно отрисовать перед тем, как отрисовывать этот виджет
     */
    renderDependence: string[];
}

declare namespace 'sham-ui' {

    class OptionsConflictResolver {
        abstract predicate( widget: Widget, options: Options ): boolean;
        abstract resolve( options: Options )
    }

    class OptionsConflictResolverManager {
        resolvers: Set<OptionsConflictResolver>;
        registry( resolver: OptionsConflictResolver ): OptionsConflictResolver;
        resolve( widget: Widget, options: Options );
    }

    class assert {
        /**
         * Error assertion
         */
        static error( message: string, condition: boolean );

        /**
         * Warning assertion
         */
        static warn( message: string, condition: boolean );
    }

    /**
     Simple DI implementation
     **/
    class DI {
        /**
         * Bind item by name
         */
        static bind( name: string, item: any );

        /**
         * Get item from container by name
         */
        static resolve( name: string ): any;
    }

    /**
     * Inject item by name
     */
    function inject( target: any, key: string, descriptor:any );

    /**
     * Decorator for auto bind & unbind events
     */
    function handler( eventType: string, selector?:string );

    /**
     * Finite State Machine
     */
    class FsmDefault {
        /**
         * Initial states
         * @default "uninitialized"
         */
        static initialState: string;

        /**
         * Initialize states
         * Default resolve from injected
         */
        initStates();

        /**
         * Transition FSM to initialState
         */
        run();

        /**
         * Fire event
         */
        emit( eventName: string );


        /**
         * Call handler in state
         */
        handle( inputType: string );

        /**
         * Transition to state
         */
        transition( newState: string );

        /**
         * Process events queue by type
         */
        processQueue( type: string );

        /**
         * Defer current action from current state to destination state
         * @param stateName Destination state
         */
        deferUntilTransition( stateName: string );

        /**
         * Subscribe listener to event
         */
        on( eventName: string, callback: Function ): { eventName: string, callback: Function, callbackID: number, off: Function };

        /**
         * Un-subscribe listener
         */
        off( eventName?: string, callback ?: Function, callbackID ?: number );

        /**
         * Subscribe once event listener
         */
        one( eventName: string, callback: Function );

        /**
         * Hook for process error
         */
        handleException( exception: Object );
    }

    class FsmState {
        constructor( fsmInstance: FsmDefault );

        _fsm: FsmDefault;

        /**
         * Call handler in state
         */
        handle( inputType: string );

        /**
         * Transition to state
         */
        transition( newState: string );

        /**
         * Defer current action from current state to destination state
         * @param stateName Destination state
         */
        deferUntilTransition( stateName: string );

        /**
         * Fire event
         */
        emit( eventName: string );

        /**
         * Hook for process error
         */
        handleException( exception: Object );
    }

    /**
     * Класс основного конечного атомата
     */
    class Fsm extends FsmDefault {
        /**
         * @default "ready"
         */
        static initialState: string;

        /**
         * Перерисовать все
         * @see {@link ReadyState#all}
         */
        ALL();

        /**
         * Перерисовать только те, ID которых переданны в аргументах
         * @param {...String} args Список ID виджетов, которые нужно отрисовать
         */
        ONLY( ...args: string[] );

        /**
         * Перерисовать все и переинициализировать
         */
        FORCE_ALL();

        /**
         * Отрисовать указанные виджеты. Помимо перерисовки еще и польностье перерегистриует
         * указанные виджеты
         * @param {...String} args Список ID виджетов, которые нужно отрисовать
         */
        FORCE_ONLY( ...args: string[] );

        /**
         * Перерисовать только с указанными типами
         * @param {...String} args Список типов виджетов, которые нужно отрисовать
         */
        ONLY_TYPE( ...args: string[] );

        /**
         * Зарегистрировать виджет
         */
        register( widget: Widget );

        /**
         * Разрегистрировать виджет
         * @param widgetId Идентификатор виджета
         */
        unregister( widgetId: string );

        /**
         * Hook for handle exception
         */
        handleException( exception: Object );
    }

    namespace FsmStates {
        /**
         * Ready state
         */
        class ready extends FsmState {
            _onEnter();

            /**
             * Удалить все виджеты
             */
            clear();

            /**
             * Отрисовать все виджеты. Просто отрисовывает, не вызывает destroy
             */
            all();

            /**
             * Отрисовать только указанные виджеты. Просто отрисовывает, не вызывает destroy
             * @param needRenderingWidgets Список виджетов, которые нужно отрисовать
             */
            only( needRenderingWidgets: string[] );

            /**
             * Отрисовать все виджеты. Вызывает destroy, очищает список известных виджетов,
             * переходит к регистрации
             */
            forceAll();

            /**
             * Отрисовать указанные виджеты. Помимо перерисовки еще и польностье перерегистриует
             * указанные виджеты
             * @param needRenderingWidgets Список виджетов, которые нужно
             *                                     перерегистривароть и отрисовать
             */
            forceOnly( needRenderingWidgets: string[] );

            /**
             * Отрисовать виджеты с указанным типом
             * @param needRenderingWidgetsWithType Список типов, которые нужно отрисовать
             */
            onlyType( needRenderingWidgetsWithType: string[] );

            /**
             * Зарегистрировать виджет (не из файла биндинга и конструкторов виджетов)
             */
            register( widget: Widget );

            /**
             * Разрегистрировать виджет
             * @param widgetId Идентификатор виджета, который нужно разрегистрировать
             */
            unregister( widgetId: string );
        }

        /**
         * Registration widgets state
         */
        class registration extends FsmState {
            /**
             * Что делать с необрабатываемыми в этом состояния хэндлерами
             */
            _anyEvents();

            /**
             * Вызывается при входе в состояние
             */
            _onEnter();

            /**
             * Зарегистрировать виджет
             */
            register( widget: Widget );

            /**
             * Все виджеты зарегисрированы
             * Если нужно, то сначала биндим обработчики событий, а потом отрисовываем
             */
            registrationComplete();
        }

        /**
         * Rendering wigets state
         */
        class rendering extends FsmState {
            /**
             * Что делать с необрабатываемыми в этом состояния хэндлеры
             */
            _anyEvents();

            /**
             * Вызывается при входе в это состояние
             */
            _onEnter();

            /**
             * Вызывается при выходе из этого состояни
             */
            _onExit();


            /**
             * Отрисовать один виджет
             * @param widget Виджет
             * @param deferred Отложенный объект для этого виджета
             */
            renderWidget( widget: Widget, deferred: Deferred );
        }
    }

    /**
     * Базовый класс для виджетов
     */
    class Widget {
        /**
         * @param containerSelector CSS-селектор элемента, в который будет
         *                                    происходить отрисовка
         * @param ID                Уникальный идентификтор
         * @param options           Опции
         */
        constructor( containerSelector: string , ID: string, options?: Options );

        /**
         * Container of this widget
         */
        container: null|Element;

        /**
         * Сначала биндим обработчики событий, потом отрисовываем
         * @default [ "bindEvents", "render" ]
         */
        actionSequence: string[];

        /**
         * Текущий инстанс библиотеки
         */
        UI: ShamUI;

        conflictResolver: OptionsConflictResolverManager;

        /**
         * Тип виджета
         */
        types: string[];

        /**
         * Если биндим обработчики событий после отрисовки, то нужно ли перебиндиивать их
         * после каждой отрисовки
         * @default true
         */
        bindOnce: boolean;

        /**
         * Массив виджетов, которые нужно отрисовать перед тем, как отрисовывать этот виджет
         */
        renderDependence: string[];

        /**
         * Нужно ли кэшировать родительский элемент для контейнера
         * @default false
         */
        cacheParentContainer: boolean;

        /**
         * Опции виджета. Переопределяют опции по-умолчанию
         */
        options: Options;

        /**
         * Функция возвращающая html для отрисовки
         */
        html: string|StringFunction;

        /**
         * Добавить обработчики событий
         */
        bindEvents();

        /**
         * Функция вызывающая при уничтожениии виджета
         */
        destroy();

        /**
         * Отрисовать виджет в контейнер
         */
        render(): { container?: Node, html?: string };

        /**
         * Query current container by this.containerSelector and save node as this.container
         */
        protected resolveContainer();
    }

    /**
     * Decorator for mark property as default value of options
     */
    function options( target: any, name: string, descriptor: any  ): any

    class ShamUI {
        render: Fsm;
    }
}