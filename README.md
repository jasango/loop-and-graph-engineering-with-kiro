# Loop and Graph Engineering with Kiro

Repositorio de apoyo para la charla **Kiro CLI en acción: automatizando el desarrollo de software con Loop Engineering**. El proyecto muestra cómo pasar de llamadas aisladas a agentes coordinados mediante loops verificables y workflows que organizan el desarrollo de principio a fin.

## Presentación

➡️ **[Ver la presentación](https://jasango.github.io/loop-and-graph-engineering-with-kiro/)**

El código fuente de la presentación está en [`presentation/`](presentation/).

## Loop Engineering en el proyecto

El repositorio explora cómo diseñar sistemas de agentes que ejecutan tareas, observan resultados, verifican el progreso y corrigen o detienen su ejecución de forma controlada. Los loops aportan iteración hasta alcanzar un objetivo comprobable; los graphs organizan las dependencias, decisiones y pasos paralelos. En conjunto, permiten automatizar procesos de desarrollo sin perder trazabilidad ni control.

- **Loop 1:** un agente y una comprobación determinista.
- **Loop 2:** creator, reviewer e improver refinan un artículo hasta aprobarlo o alcanzar el límite de iteraciones.
- **Loop 3:** el mismo patrón editorial expresado como Kiro Workflow.
- **Loop 4:** un SDLC completo con workflows de especificación, construcción y despliegue.

## Estructura del proyecto

| Carpeta | Contenido | Documentación |
| --- | --- | --- |
| [`Loop1/`](Loop1/README.md) | Loop programático mínimo: un agente y una comprobación determinista. | [README de Loop 1](Loop1/README.md) |
| [`Loop2/`](Loop2/README.md) | Refinamiento de artículos con creator, reviewer e improver, controlado por un script. | [README de Loop 2](Loop2/README.md) |
| [`Loop3/`](Loop3/README.md) | El mismo patrón editorial expresado como Kiro Workflow. | [README de Loop 3](Loop3/README.md) |
| [`Loop4/`](Loop4/README.md) | SDLC completo con workflows de especificación, construcción y despliegue. | [README de Loop 4](Loop4/README.md) |
| [`.kiro/`](.kiro/) | Agentes, prompts y recetas de workflows usados por los loops. | — |
| [`presentation/`](presentation/README.md) | Presentación estática, recursos multimedia y smoke test local. | [README de la presentación](presentation/README.md) |

## Cómo ejecutar los loops

Los requisitos comunes son tener Kiro CLI instalado, autenticado y con los modelos/configuración que describe cada README. Ejecuta cada loop desde la raíz del repositorio:

- Loop 1: `sh Loop1/hello_world_loop.sh`
- Loop 2: `sh Loop2/refine_article_loop.sh "tema del artículo"`
- Loop 3: abre una sesión V3 de Kiro CLI y ejecuta `/workflow run refine-article`; consulta [`Loop3/README.md`](Loop3/README.md) para los prerrequisitos.
- Loop 4: ejecuta desde Kiro IDE los workflows `software-spec`, `software-build` y `software-deploy`, siguiendo [`Loop4/README.md`](Loop4/README.md).

La carpeta `presentation/` es independiente de los loops y puede servirse como una página estática. Sus pruebas locales están documentadas en [`presentation/README.md`](presentation/README.md).
