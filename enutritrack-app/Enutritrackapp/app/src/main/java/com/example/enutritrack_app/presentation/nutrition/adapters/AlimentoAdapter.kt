package com.example.enutritrack_app.presentation.nutrition.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.enutritrack_app.data.local.entities.AlimentoEntity
import com.example.enutritrack_app.databinding.ItemAlimentoBinding

class AlimentoAdapter(
    private val onEditarClick: (String) -> Unit,
    private val onEliminarClick: (AlimentoEntity) -> Unit
) : ListAdapter<AlimentoEntity, AlimentoAdapter.AlimentoViewHolder>(AlimentoDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AlimentoViewHolder {
        val binding = ItemAlimentoBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return AlimentoViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AlimentoViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class AlimentoViewHolder(
        private val binding: ItemAlimentoBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(alimento: AlimentoEntity) {
            binding.nombreText.text = alimento.nombre
            binding.categoriaText.text = alimento.categoria ?: "Sin categoría"
            binding.descripcionText.text = alimento.descripcion ?: "Sin descripción"
            
            // Valores nutricionales por 100g
            binding.valoresText.text = String.format(
                "Cal: %.1f | Prot: %.1fg | Carb: %.1fg | Grasas: %.1fg",
                alimento.calorias_por_100g,
                alimento.proteinas_g_por_100g,
                alimento.carbohidratos_g_por_100g,
                alimento.grasas_g_por_100g
            )
            
            binding.editarButton.setOnClickListener {
                onEditarClick(alimento.id)
            }
            
            binding.eliminarButton.setOnClickListener {
                onEliminarClick(alimento)
            }
        }
    }

    private class AlimentoDiffCallback : DiffUtil.ItemCallback<AlimentoEntity>() {
        override fun areItemsTheSame(
            oldItem: AlimentoEntity,
            newItem: AlimentoEntity
        ): Boolean = oldItem.id == newItem.id

        override fun areContentsTheSame(
            oldItem: AlimentoEntity,
            newItem: AlimentoEntity
        ): Boolean = oldItem == newItem
    }
}

