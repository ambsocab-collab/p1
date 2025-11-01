# API Specification

Based on our REST API choice, here's the OpenAPI 3.0 specification for all required endpoints:

```yaml
openapi: 3.0.0
info:
  title: AMFE Tool API
  version: 1.0.0
  description: REST API for AMFE Failure Analysis Tool
servers:
  - url: https://api.amfe-tool.com
    description: Production server
  - url: http://localhost:3000
    description: Development server

paths:
  # AMFE Management
  /amfes:
    get:
      summary: List all AMFEs
      tags: [AMFEs]
      parameters:
        - name: type
          in: query
          schema:
            type: string
            enum: [DFMEA, PFMEA]
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, in_progress, completed, archived]
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of AMFEs
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/AMFE'

    post:
      summary: Create new AMFE
      tags: [AMFEs]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AMFECreate'
      responses:
        '201':
          description: AMFE created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AMFE'

  /amfes/{id}:
    get:
      summary: Get AMFE by ID
      tags: [AMFEs]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: AMFE details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AMFEWithItems'

    put:
      summary: Update AMFE
      tags: [AMFEs]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AMFEUpdate'
      responses:
        '200':
          description: AMFE updated

    delete:
      summary: Delete AMFE
      tags: [AMFEs]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: AMFE deleted

  # AMFE Items
  /amfes/{id}/items:
    get:
      summary: Get AMFE items
      tags: [AMFE Items]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of AMFE items
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/AMFEItem'

    post:
      summary: Add AMFE item
      tags: [AMFE Items]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AMFEItemCreate'
      responses:
        '201':
          description: Item created

  /amfes/{id}/items/batch:
    put:
      summary: Batch update AMFE items
      tags: [AMFE Items]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/AMFEItem'
      responses:
        '200':
          description: Items updated

  # Corrective Actions
  /actions:
    get:
      summary: List corrective actions
      tags: [Actions]
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, in_progress, completed, verified]
        - name: responsible
          in: query
          schema:
            type: string
        - name: due_before
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: List of actions
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/CorrectiveAction'

    post:
      summary: Create corrective action
      tags: [Actions]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CorrectiveActionCreate'
      responses:
        '201':
          description: Action created

  /actions/{id}:
    put:
      summary: Update corrective action
      tags: [Actions]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CorrectiveActionUpdate'
      responses:
        '200':
          description: Action updated

  # Failure Modes Library
  /failure-modes:
    get:
      summary: Get failure modes library
      tags: [Library]
      parameters:
        - name: category
          in: query
          schema:
            type: string
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Failure modes list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/FailureMode'

  # Evidence Upload
  /actions/{id}/evidence:
    post:
      summary: Upload evidence file
      tags: [Evidence]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                description:
                  type: string
      responses:
        '201':
          description: Evidence uploaded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Evidence'

  # Reports Export
  /amfes/{id}/export/pdf:
    get:
      summary: Export AMFE as PDF
      tags: [Reports]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
        - name: include_actions
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: PDF file
          content:
            application/pdf:
              schema:
                type: string
                format: binary

  /amfes/{id}/export/excel:
    get:
      summary: Export AMFE as Excel
      tags: [Reports]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Excel file
          content:
            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
              schema:
                type: string
                format: binary

components:
  schemas:
    AMFE:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        type:
          type: string
          enum: [DFMEA, PFMEA]
        description:
          type: string
        status:
          type: string
          enum: [draft, in_progress, completed, archived]
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        created_by:
          type: string
        npr_threshold:
          type: number
        metadata:
          type: object
          properties:
            version:
              type: number
            tags:
              type: array
              items:
                type: string

    AMFECreate:
      type: object
      required: [name, type]
      properties:
        name:
          type: string
        type:
          type: string
          enum: [DFMEA, PFMEA]
        description:
          type: string
        scope:
          type: string
        npr_threshold:
          type: number
          default: 100

    AMFEUpdate:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [draft, in_progress, completed, archived]
        npr_threshold:
          type: number

    AMFEWithItems:
      allOf:
        - $ref: '#/components/schemas/AMFE'
        - type: object
          properties:
            items:
              type: array
              items:
                $ref: '#/components/schemas/AMFEItem'
            actions:
              type: array
              items:
                $ref: '#/components/schemas/CorrectiveAction'

    AMFEItem:
      type: object
      properties:
        id:
          type: string
        amfe_id:
          type: string
        row_number:
          type: number
        function:
          type: string
        failure_mode:
          type: string
        failure_effect:
          type: string
        failure_cause:
          type: string
        current_controls:
          type: string
        severity:
          type: number
          minimum: 1
          maximum: 10
        occurrence:
          type: number
          minimum: 1
          maximum: 10
        detection:
          type: number
          minimum: 1
          maximum: 10
        npr:
          type: number
        risk_level:
          type: string
          enum: [low, medium, high, critical]
        notes:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    AMFEItemCreate:
      type: object
      required: [function, failure_mode, failure_effect, failure_cause, current_controls, severity, occurrence, detection]
      properties:
        function:
          type: string
        failure_mode:
          type: string
        failure_effect:
          type: string
        failure_cause:
          type: string
        current_controls:
          type: string
        severity:
          type: number
          minimum: 1
          maximum: 10
        occurrence:
          type: number
          minimum: 1
          maximum: 10
        detection:
          type: number
          minimum: 1
          maximum: 10
        notes:
          type: string

    CorrectiveAction:
      type: object
      properties:
        id:
          type: string
        amfe_item_id:
          type: string
        description:
          type: string
        responsible:
          type: string
        contact:
          type: string
        due_date:
          type: string
          format: date
        cost_estimated:
          type: number
        cost_actual:
          type: number
        status:
          type: string
          enum: [pending, in_progress, completed, verified]
        completion_date:
          type: string
          format: date
        roi:
          type: number
        notes:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    CorrectiveActionCreate:
      type: object
      required: [amfe_item_id, description, responsible, due_date]
      properties:
        amfe_item_id:
          type: string
        description:
          type: string
        responsible:
          type: string
        contact:
          type: string
        due_date:
          type: string
          format: date
        cost_estimated:
          type: number

    CorrectiveActionUpdate:
      type: object
      properties:
        description:
          type: string
        status:
          type: string
          enum: [pending, in_progress, completed, verified]
        completion_date:
          type: string
          format: date
        cost_actual:
          type: number

    FailureMode:
      type: object
      properties:
        id:
          type: string
        category:
          type: string
        mode:
          type: string
        common_causes:
          type: array
          items:
            type: string
        severity_default:
          type: number
        tags:
          type: array
          items:
            type: string
        industry_type:
          type: string

    Evidence:
      type: object
      properties:
        id:
          type: string
        action_id:
          type: string
        file_name:
          type: string
        file_path:
          type: string
        file_type:
          type: string
        file_size:
          type: number
        description:
          type: string
        created_at:
          type: string
          format: date-time

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
  - {}
```

---
